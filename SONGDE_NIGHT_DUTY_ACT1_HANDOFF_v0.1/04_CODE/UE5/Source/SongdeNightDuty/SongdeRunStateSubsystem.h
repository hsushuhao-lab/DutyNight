#pragma once

#include "CoreMinimal.h"
#include "Subsystems/GameInstanceSubsystem.h"
#include "SongdeRunStateSubsystem.generated.h"

UCLASS()
class SONGDENIGHTDUTY_API USongdeRunStateSubsystem : public UGameInstanceSubsystem
{
    GENERATED_BODY()

public:
    UPROPERTY(BlueprintReadOnly) int32 Duty = 0;
    UPROPERTY(BlueprintReadOnly) int32 Evidence = 0;
    UPROPERTY(BlueprintReadOnly) int32 Identity = 3;
    UPROPERTY(BlueprintReadOnly) int32 Fatigue = 0;

    UFUNCTION(BlueprintCallable) void AddDuty(int32 Delta) { Duty += Delta; }
    UFUNCTION(BlueprintCallable) void AddEvidence(int32 Delta) { Evidence += Delta; }
    UFUNCTION(BlueprintCallable) void AddIdentity(int32 Delta) { Identity += Delta; }
    UFUNCTION(BlueprintCallable) void AddFatigue(int32 Delta) { Fatigue += Delta; }

    UFUNCTION(BlueprintCallable) void SetFlag(FName Flag, bool bValue = true);
    UFUNCTION(BlueprintPure) bool GetFlag(FName Flag) const;

private:
    UPROPERTY() TMap<FName, bool> Flags;
};
