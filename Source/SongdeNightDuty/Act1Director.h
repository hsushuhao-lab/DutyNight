#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "Act1Director.generated.h"

UENUM(BlueprintType)
enum class EAct1EndChoice : uint8
{
    AskNurse,
    CheckRecord,
    DismissAndRest
};

UCLASS()
class SONGDENIGHTDUTY_API AAct1Director : public AActor
{
    GENERATED_BODY()

public:
    UFUNCTION(BlueprintCallable) void MarkTaskComplete(FName TaskId);
    UFUNCTION(BlueprintPure) bool AreRequiredTasksComplete() const;
    UFUNCTION(BlueprintCallable) bool TryTriggerPriorityWindow();
    UFUNCTION(BlueprintCallable) bool TryTriggerAnomalyHook();
    UFUNCTION(BlueprintCallable) void ResolveEndChoice(EAct1EndChoice Choice);

protected:
    UPROPERTY(EditAnywhere, BlueprintReadOnly)
    TArray<FName> RequiredTasks = {
        "KEY_PICKUP", "DUTY_LOG", "E_HANDOFF", "DUTY_ROOM_SETUP",
        "DINNER_ORDER", "ROUND_01", "ROUTINE_CALL", "DOCUMENT"
    };

    UPROPERTY(BlueprintReadOnly) TSet<FName> CompletedTasks;
    UPROPERTY(BlueprintReadOnly) bool bPriorityWindowTriggered = false;
    UPROPERTY(BlueprintReadOnly) bool bAnomalyTriggered = false;
};
