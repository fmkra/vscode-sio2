import { ContestItem } from "./ProblemsView";

export async function fetchContests() {
    await new Promise((r) => setTimeout(r, 5000));
    return [new ContestItem("contest 1"), new ContestItem("contest 2")];
}

export async function fetchProblems(contestId: string) {
    await new Promise((r) => setTimeout(r, 5000));
    if (contestId === "contest 1") return ["prob 1", "prob 2", "prob 3"];
    else return ["prob a", "prob b"];
}
