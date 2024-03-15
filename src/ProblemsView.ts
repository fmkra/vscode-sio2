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
        };
    }
}

export class ContestItem {
    contestId: string;
    problems: ProblemItem[] | null;

    constructor(contestId: string) {
        this.contestId = contestId;
        this.problems = null;
    }

    async getChildren() {
        await new Promise((r) => setTimeout(r, 3000));
        if (!this.problems) {
            const problemList = await fetchProblems(this.contestId);
            this.problems = problemList.map(
                (problem) => new ProblemItem(this, problem)
            );
        }
        return this.problems;
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

let contests: ContestItem[] | undefined;
async function getContests() {
    if (!contests) {
        contests = await fetchContests();
    }
    return contests;
}

type TreeItem = ProblemItem | ContestItem;

function treeDataProvider(): vscode.TreeDataProvider<TreeItem> {
    return {
        getChildren: (element) =>
            element ? element.getChildren() : getContests(),
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
