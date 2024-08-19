class EventBus {
    constructor() {
        this.handlers = {};
    }

    $on(type, handler) {
        if (!(type in this.handlers)) {
            this.handlers[type] = [];
        }
        this.handlers[type].push(handler);
    }

    $emit(type, ...args) {
        if (type in this.handlers) {
            this.handlers[type].forEach(handler => {
                handler(...args);
            });
        }
    }

    $off(type, handler) {
        if (!(type in this.handlers)) return;
        const index = this.handlers[type].indexOf(handler);
        if (index > -1) {
            this.handlers[type].splice(index, 1);
        }
    }
}

const eventBus = new EventBus();
export default eventBus;