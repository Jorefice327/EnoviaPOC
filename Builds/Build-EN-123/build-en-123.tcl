tcl; 

eval { 
	set sCurrentDir [pwd]
    set logsDir "${sCurrentDir}/logs_Build_EN_653"
	set sScriptName "Build_EN_653"
	mql start transaction;
	file mkdir $logsDir
	set errorLog [ open "${logsDir}/${sScriptName}_Error.log" w+ ]
	set traceLog [ open "${logsDir}/${sScriptName}_Trace.log" w+ ]

	puts $traceLog "Started Script : $sScriptName"
    puts " Started Script : $sScriptName"

	set scriptValue [ catch {
        
        mql add bus "eService Trigger Program Parameters" "PolicyChangeActionStateInWorkPromoteCheck" "CheckAttachedEquivalentPartState" vault "eService Administration" \
        description "Checks that for each part attached to the CA, if the part has any MEPs, at least one MEP is in the Released state." \
        policy "eService Trigger Program Policy" current Active "eService Sequence Number" 7 \
        "eService Program Name" "enoECMChangeAction" "eService Method Name" "checkAttachedEquivalentPartState" "eService Program Argument 1" "$\{OBJECTID\}"

        puts "Succesfully added trigger."
        puts $traceLog "Successfully added trigger."
    
    } result ]

    if { $scriptValue == 0} {
		puts $traceLog "Finished Script : $sScriptName"
		puts $traceLog "SUCCESS : script executed successfully"
		puts "\n SUCCESS : script executed successfully"
		mql commit transaction;
	}
	if { $scriptValue == 1 } {
		puts $errorLog "ERROR : $result"
		puts $traceLog "ERROR : script terminated with Error. Check error log"
		puts "\n ERROR : script terminated with Error. Check error log"
		mql abort transaction;
	}

    flush $traceLog
	flush $errorLog
	close $traceLog
	close $errorLog
}