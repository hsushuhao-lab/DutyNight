using UnrealBuildTool;

public class SongdeNightDuty : ModuleRules
{
    public SongdeNightDuty(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core", "CoreUObject", "Engine", "InputCore", "EnhancedInput", "UMG"
        });
    }
}
