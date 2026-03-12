export default class CurrentUserDTO {
    constructor(user) {
        this.id = user._id || user.id;
        this.first_name = user.first_name || "";
        this.last_name = user.last_name || "";
        this.email = user.email || "";
        this.age = user.age || null;
        this.role = user.role || "user";
        this.cart = user.cart || null;
    }
}
