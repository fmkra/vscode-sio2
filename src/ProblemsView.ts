import * as vscode from "vscode";
import { fetchContests, fetchProblems } from "./api";

export class ProblemItem {
    constructor(readonly contest: ContestItem, readonly problemId: string) {}

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

export class ContestItem {
    contestId: string;

    constructor(contestId: string) {
        this.contestId = contestId;
    }

    async getChildren() {
        const problemList = await fetchProblems(this.contestId);
        return problemList.map((problem) => new ProblemItem(this, problem));
    }

    getParent() {
        return undefined;
    }

    getTreeItem(): vscode.TreeItem {
        return {
            label: {
                label: this.contestId,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }
}

type TreeItem = ProblemItem | ContestItem;

function treeDataProvider(): vscode.TreeDataProvider<TreeItem> {
    return {
        getChildren: (element) =>
            element ? element.getChildren() : fetchContests(),
        getParent: (element) => element.getParent(),
        getTreeItem: (element) => element.getTreeItem(),
    };
}

export class ProblemsView {
    constructor(context: vscode.ExtensionContext) {
        const view = vscode.window.createTreeView("sio2-problems", {
            treeDataProvider: treeDataProvider(),
            showCollapseAll: true,
        });
        context.subscriptions.push(view);
    }
}
