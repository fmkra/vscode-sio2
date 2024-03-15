"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProblemsView = exports.ContestItem = exports.ProblemItem = void 0;
const vscode = __importStar(require("vscode"));
const api_1 = require("./api");
class ProblemItem {
    contest;
    problemId;
    constructor(contest, problemId) {
        this.contest = contest;
        this.problemId = problemId;
    }
    getChildren() {
        return [];
    }
    getParent() {
        return this.contest;
    }
    getTreeItem() {
        return {
            label: {
                label: this.problemId,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "problem",
        };
    }
}
exports.ProblemItem = ProblemItem;
class ContestItem {
    contestId;
    constructor(contestId) {
        this.contestId = contestId;
    }
    async getChildren() {
        const problemList = await (0, api_1.fetchProblems)(this.contestId);
        return problemList.map((problem) => new ProblemItem(this, problem));
    }
    getParent() {
        return undefined;
    }
    getTreeItem() {
        return {
            label: {
                label: this.contestId,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }
}
exports.ContestItem = ContestItem;
function treeDataProvider() {
    return {
        getChildren: (element) => element ? element.getChildren() : (0, api_1.fetchContests)(),
        getParent: (element) => element.getParent(),
        getTreeItem: (element) => element.getTreeItem(),
    };
}
class ProblemsView {
    constructor(context) {
        const view = vscode.window.createTreeView("sio2-problems", {
            treeDataProvider: treeDataProvider(),
            showCollapseAll: true,
        });
        context.subscriptions.push(view);
    }
}
exports.ProblemsView = ProblemsView;
//# sourceMappingURL=ProblemsView.js.map