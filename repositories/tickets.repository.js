import TicketDAO from "../dao/mongo/tickets.dao.js";

export default class TicketsRepository {
    constructor() {
        this.dao = new TicketDAO();
    }

    create = async (data) => this.dao.create(data);
}