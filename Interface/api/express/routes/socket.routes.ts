import { Router, Request, Response } from "express";

const router = Router();

// Endpoint pour émettre des événements Socket.IO depuis Next.js
router.post("/emit", (req: Request, res: Response) => {
	try {
		const { event, room, userId, conversationId, data } = req.body;
		const io = (global as any).io;

		if (!io) {
			return res.status(500).json({ error: "Socket.IO not initialized" });
		}

		// Emit to specific user
		if (userId) {
			io.to(`user:${userId}`).emit(event, data);
			console.log(`📤 Emitted ${event} to user:${userId}`);
		}
		// Emit to specific conversation
		else if (conversationId) {
			io.to(`conversation:${conversationId}`).emit(event, data);
			console.log(`📤 Emitted ${event} to conversation:${conversationId}`);
		}
		// Emit to specific room (e.g. advisors)
		else if (room) {
			io.to(room).emit(event, data);
			console.log(`📤 Emitted ${event} to room:${room}`);
		}
		// Broadcast to all
		else {
			io.emit(event, data);
			console.log(`📤 Broadcast ${event} to all clients`);
		}

		res.json({ success: true });
	} catch (error) {
		console.error("Error emitting socket event:", error);
		res.status(500).json({ error: "Failed to emit event" });
	}
});

export default router;
