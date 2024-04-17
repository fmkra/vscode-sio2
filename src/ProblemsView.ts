import * as vscode from "vscode";
import Api from "./api";
import * as dto from "./dto";

export class ProblemItem {
    constructor(
        private api: Api,
        readonly contest: ContestItem,
        readonly problem: dto.Problem
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
                label: this.problem.short_name,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.None,
            contextValue: "problem",
        };
    }
}

export class ContestItem {
    constructor(private api: Api, readonly contest: dto.Contest) {}

    async getChildren() {
        const problemList = await this.api.getProblems(this.contest.id);
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
                label: this.contest.name,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        };
    }
}

export class ErrorItem {
    constructor(private detail: string) {}

    getChildren() {
        return [];
    }

    getParent() {
        return undefined;
    }

    getTreeItem() {
        return {
            label: {
                label: this.detail,
            },
            collapsibleState: vscode.TreeItemCollapsibleState.None,
        };
    }
}

type TreeItem = ProblemItem | ContestItem | ErrorItem;

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
            try {
                const contests = await this.api.getContests();
                return contests.map(
                    (contest) => new ContestItem(this.api, contest)
                );
            } catch (e) {
                return [new ErrorItem(e?.toString() ?? "Unknown error")];
            }
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
