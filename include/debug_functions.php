<?php
//Debugging functions
function isDebugMode()
{
	global $config;
	$isTest = is_callable("currentScriptName") && contains(currentScriptName(),"test");
	return $isTest || getConfig("debug.output")  || reqParam("debug")==="true";
}

function startTimer()
{
	global $startTime;
	$startTime = microtime(true);
	return $startTime;
}

function getTimer()
{
	global $startTime, $endTime;
	$endTime = microtime(true);
	return $endTime - $startTime;
}

function getTimerSinceLast()
{
	global $endTime;
	$time = microtime(true);
	$result = $time - $endTime;
	$endTime = $time;
	return $result;
}

function debugVar($name, $indent=0)
{
	debug($name, @$GLOBALS[$name], $indent);
}

function debug($text="", $value=null, $indent=0)
{
	if(!isDebugMode()) return;

	if(!$value && !$text)
		echo "\n";
	else if($indent==="print_r")
	{
		echo "$text: ";
		print_r($value);
	}
	else if(!isset($value) || $value===null)
		echo "$text:\n";
	else if (is_bool($value))
		echo "$text: " . BtoS($value) . "\n";
	else if (is_scalar($value))
		echo "$text: $value\n";
	else
		echo "$text: " . jsValue($value, $indent) . "\n";
}

function debugText($text="", $value=null)
{
	if(!isDebugMode()) return;
	if(is_array($value))
		$value=implode("\n", $value);

	if(!$value && !$text)
		echo "\n";
	else if(!isset($value) || $value===null)
		echo "$text\n";
	else if(contains($value,"\n"))
		echo "$text:\n$value\n\n";
	else
		echo "$text: $value\n";
}


function debugStack($levels=1)
{
	if(!isDebugMode()) return;
	$stack=debug_backtrace();
	if($levels!=1)	debug("\nSTACK");
	
	for($i=1; $i<count($stack); $i++)
	{
		$file="";
		if(isset($stack[$i]["file"])) $file= basename($stack[$i]["file"], ".php");
//		if(isset($stack[$i]["line"])) $line= $stack[$i]["line"];
		$funk=combine($file, $stack[$i-1]["line"], $stack[$i]["function"]);
		debug($funk, $stack[$i]["args"]);
		if($i==$levels) break;
	}
}
?>