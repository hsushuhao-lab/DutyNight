#include "SongdeRunStateSubsystem.h"

void USongdeRunStateSubsystem::SetFlag(FName Flag, bool bValue)
{
    Flags.FindOrAdd(Flag) = bValue;
}

bool USongdeRunStateSubsystem::GetFlag(FName Flag) const
{
    if (const bool* Value = Flags.Find(Flag))
    {
        return *Value;
    }
    return false;
}
