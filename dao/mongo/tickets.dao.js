import { TicketModel } from "../../models/ticket.model.js";

export default class TicketsDAO {
    create = async (data) => {
        return await TicketModel.create(data);
    };
}