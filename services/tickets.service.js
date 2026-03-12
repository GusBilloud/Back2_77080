import TicketRepository from "../repositories/tickets.repository.js";

const ticketRepository = new TicketRepository();

export default class TicketsService {
    createTicket = async ({ amount, purchaser }) => {
        if (!amount || amount <= 0) {
            const error = new Error("Invalid ticket amount");
            error.statusCode = 400;
            throw error;
        }

        if (!purchaser) {
            const error = new Error("Purchaser is required");
            error.statusCode = 400;
            throw error;
        }

        const code = `TCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const ticket = await ticketRepository.create({
            code,
            purchase_datetime: new Date(),
            amount,
            purchaser,
        });

        return ticket;
    };

    getTicketById = async (tid) => {
        const ticket = await ticketRepository.getById(tid);

        if (!ticket) {
            const error = new Error("Ticket not found");
            error.statusCode = 404;
            throw error;
        }

        return ticket;
    };
}