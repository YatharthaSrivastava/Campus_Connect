const CryptoService = require('../services/cryptoService');
const StoreService = require('../services/storeService');

const initSocketHandlers = (io) => {
  // Track message rates per socket: map of socket.id -> array of timestamps
  const messageTracker = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected to WebSocket: ${socket.id}`);
    messageTracker.set(socket.id, []);

    /**
     * Event: join_study_room
     * Per API Reference:
     * socket.emit('join_study_room', { roomId: 'dbms_sec_a' });
     */
    socket.on('join_study_room', (data) => {
      const roomId = data?.roomId || 'default_study_room';
      socket.join(roomId);
      console.log(`👥 Socket ${socket.id} joined study room: ${roomId}`);
      socket.emit('room_joined', {
        roomId,
        status: 'success',
        message: `Connected to ${roomId} live study channel`,
      });
    });

    /**
     * Event: study_room_message
     * Instant peer study chat with 30 msgs/minute throttling
     */
    socket.on('send_message', (payload) => {
      const { roomId, message, senderName, senderEmail } = payload || {};
      const now = Date.now();

      // Throttling check: max 30 messages/minute
      let timestamps = messageTracker.get(socket.id) || [];
      timestamps = timestamps.filter((t) => now - t < 60000);
      if (timestamps.length >= 30) {
        socket.emit('error', { message: 'Chat rate limit reached (max 30 msgs/min).' });
        return;
      }
      timestamps.push(now);
      messageTracker.set(socket.id, timestamps);

      if (roomId && message) {
        io.to(roomId).emit('receive_message', {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          roomId,
          message,
          senderName: senderName || 'Peer Student',
          senderEmail: senderEmail || '',
          timestamp: new Date().toISOString(),
        });
      }
    });

    /**
     * Event: verify_handshake_qr
     * Per API Reference:
     * socket.emit('verify_handshake_qr', { transactionId: 'tx_9921', otp: '4829' });
     */
    socket.on('verify_handshake_qr', async (data) => {
      const { transactionId, otp, qrPayload } = data || {};
      console.log(`🤝 Handshake verify requested for tx: ${transactionId}`);

      try {
        const tx = await StoreService.findTransactionById(transactionId);
        if (!tx) {
          socket.emit('handshake_result', {
            status: 'error',
            message: 'Transaction not found or expired',
          });
          return;
        }

        if (tx.status === 'completed') {
          socket.emit('handshake_result', {
            status: 'error',
            message: 'Transaction already completed.',
          });
          return;
        }

        let submittedOTP = otp;
        if (!submittedOTP && qrPayload) {
          const decoded = CryptoService.verifyQRPayload(qrPayload);
          if (decoded && decoded.transactionId === transactionId) {
            submittedOTP = decoded.otp;
          }
        }

        const isValid = CryptoService.verifyOTPHash(submittedOTP, tx.otpHash);
        if (!isValid) {
          socket.emit('handshake_result', {
            status: 'error',
            message: 'Invalid OTP or QR code.',
          });
          return;
        }

        // Complete transaction atomically
        const completed = await StoreService.completeTransaction(
          transactionId,
          tx.buyerId,
          tx.sellerId,
          15
        );

        const resultPayload = {
          status: 'verified',
          transactionId,
          completedAt: completed.completedAt,
          karmaAwarded: 15,
          message: 'Physical handshake verified! +15 Campus Karma awarded.',
        };

        // Notify caller and broadcast to transaction room
        socket.emit('handshake_result', resultPayload);
        io.to(`tx_${transactionId}`).emit('transaction_completed', resultPayload);
      } catch (err) {
        console.error('WebSocket handshake error:', err);
        socket.emit('handshake_result', {
          status: 'error',
          message: 'Server error during handshake verification',
        });
      }
    });

    socket.on('disconnect', () => {
      messageTracker.delete(socket.id);
    });
  });
};

module.exports = initSocketHandlers;
