"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../src/db/prisma"));
async function test() {
    const user = await prisma_1.default.user.create({
        data: {
            githubId: '999999',
            username: 'TEST_USER',
            email: 'test@example.com',
        },
    });
    console.log('Created user:', user);
}
test();
//# sourceMappingURL=user.test.js.map