#include "Act1Director.h"
#include "SongdeRunStateSubsystem.h"
#include "Engine/GameInstance.h"

void AAct1Director::MarkTaskComplete(FName TaskId)
{
    CompletedTasks.Add(TaskId);
}

bool AAct1Director::AreRequiredTasksComplete() const
{
    for (const FName& Task : RequiredTasks)
    {
        if (!CompletedTasks.Contains(Task)) return false;
    }
    return true;
}

bool AAct1Director::TryTriggerPriorityWindow()
{
    if (bPriorityWindowTriggered || !AreRequiredTasksComplete()) return false;
    bPriorityWindowTriggered = true;
    return true;
}

bool AAct1Director::TryTriggerAnomalyHook()
{
    if (bAnomalyTriggered || !bPriorityWindowTriggered) return false;
    bAnomalyTriggered = true;
    return true;
}

void AAct1Director::ResolveEndChoice(EAct1EndChoice Choice)
{
    if (!GetGameInstance()) return;
    USongdeRunStateSubsystem* State = GetGameInstance()->GetSubsystem<USongdeRunStateSubsystem>();
    if (!State) return;

    switch (Choice)
    {
    case EAct1EndChoice::AskNurse:
        State->AddEvidence(1);
        State->SetFlag("NURSE_WITNESS_SEED");
        break;
    case EAct1EndChoice::CheckRecord:
        State->AddEvidence(1);
        State->SetFlag("LOGIN_MISMATCH_SEED");
        break;
    case EAct1EndChoice::DismissAndRest:
        State->AddFatigue(-1);
        State->SetFlag("UNSEEN_HELP_SEED");
        break;
    }

    State->SetFlag("ACT1_COMPLETE");
}
