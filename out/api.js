"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProblems = exports.fetchContests = void 0;
const ProblemsView_1 = require("./ProblemsView");
async function fetchContests() {
    await new Promise((r) => setTimeout(r, 5000));
    return [new ProblemsView_1.ContestItem("contest 1"), new ProblemsView_1.ContestItem("contest 2")];
}
exports.fetchContests = fetchContests;
async function fetchProblems(contestId) {
    await new Promise((r) => setTimeout(r, 5000));
    if (contestId === "contest 1")
        return ["prob 1", "prob 2", "prob 3"];
    else
        return ["prob a", "prob b"];
}
exports.fetchProblems = fetchProblems;
//# sourceMappingURL=api.js.map