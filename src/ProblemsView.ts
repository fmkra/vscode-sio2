import * as vscode from "vscode";
import Api from "./Api";

export class ProblemItem {
    constructor(
        private api: Api,
        readonly contest: ContestItem,
        readonly problemId: string
    ) {}

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

    constructor(private api: Api, contestId: string) {
        this.contestId = contestId;
    }

    async getChildren() {
        const problemList = await this.api.getProblems(this.contestId);
        return problemList.map(
            (problem) => new ProblemItem(this.api, this, problem)
        );
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

export class ProblemsView {
    constructor(
        context: vscode.ExtensionContext,
        private api: Api,
        private dataChangedEvent: vscode.Event<void>
    ) {
        const view = vscode.window.createTreeView("sio2-problems", {
            treeDataProvider: this.treeDataProvider(),
            showCollapseAll: true,
        });
        context.subscriptions.push(view);
    }

    treeDataProvider(): vscode.TreeDataProvider<TreeItem> {
        const getContests = async () => {
            const contests = await this.api.getContests();
            return contests.map(
                (contest) => new ContestItem(this.api, contest)
            );
        };
        return {
            getChildren: (element) =>
                element ? element.getChildren() : getContests(),
            getParent: (element) => element.getParent(),
            getTreeItem: (element) => element.getTreeItem(),
            onDidChangeTreeData: this.dataChangedEvent,
        };
    }
}
