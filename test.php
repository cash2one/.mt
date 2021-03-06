<?php
error_reporting(E_ERROR | E_WARNING | E_PARSE | E_NOTICE);
ini_set('display_errors', '1');
//error_reporting(E_PARSE);
$configFile="include/config.php";
if(file_exists("../$configFile"))	$configFile = "../$configFile";
require_once($configFile);

debug();
debug("PHP OS", PHP_OS);
debugVar("_SERVER", true);
debug("is Unix", isUnix());
debug("is Windows", isWindows());

debug();
$data = array(0, 1, 2, 3, 4 ,5, 6);
$dataSplit = arrayDivide($data, 3, false);
debugVar("dataSplit");
$dataSplit = arrayDivide($data, 3, true);
debugVar("dataSplit");
debug("substringBefore", substringBefore("somebody new to shine", " "));
debug("substringAfter",  substringAfter("somebody new to shine", " "));
debug("substringBeforeLast", substringBeforeLast("somebody new to shine", " "));
debug("substringAfterLast",  substringAfterLast("somebody new to shine", " "));
debug("splitBeforeAfter",  splitBeforeAfter("somebody new to shine", " "));
debug("splitBeforeAfter last",  splitBeforeAfter("somebody new to shine", " ", true));
debug();
$text = "I came up with this recipe when I had some leftover canned tomatoes and decided to come up with a quick pasta sauce.
Normally I would have added basil to the sauce, but since I had some oregano on hand and I decided to use it instead. 
I also threw in a few sundried tomatoes to sweeten the sauce a bit.";

debug("cutAfterSentence 100", cutAfterSentence($text, 100));
debug("cutAfterSentence 200", cutAfterSentence($text, 200));
debug("cutAfterSentence 300", cutAfterSentence($text, 300));

debug();
debug("GD Info", gd_info(), true);

//debug("Defined functions", get_defined_functions(), true);
$pdjConfig2 = readConfigFile("../pdj/pdj.config");
echoJsVar("pdjConfig2");

$meta = metaTags($path);
echo jsValue($meta, true, true);
debug("arrayGet", arrayGet($config,"TYPES.VIDEO"));
debug();
debug("publish");
$publish = getConfig("_publish");
debugVar("publish");
debug();
debug("publish.site");
$site = getParam("site", $publish["default"]);
$publish = getConfig("_publish.$site");
debugVar("publish");

$byType = getParamBoolean("bytype",true);

debug();
debug("maxSize");
$maxSize = arrayGet($publish, "image.size");
debugVar("maxSize");
$maxSize = getConfig("_publish.$site.image.size");
debugVar("maxSize");
//should be null
$notfound = getConfig("_publish.$site.ima.size");
debug("notfound", is_null($notfound));

$sizeOptions = getConfig("SIZE");
debugVar("sizeOptions");

//splitChunks("../2013", "197642876.mp4", 2000000, $chunks);
//debugVar("chunks");
//joinChunks("../2013", "197642876.mp4", false);

debug("USER");
debug("Logged in", is_loggedin());
debug("User", current_user());
debug("Upload ", is_uploader());
debug("Admin ",is_admin());
debug("Local", isLocal());

debug();
debug("CLIENT");
debug("User agent", $_SERVER['HTTP_USER_AGENT']);
debug("iPad", isIpad());
debug("Android", isAndroid());
debug("Kindle", isKindle());
debug("Mobile", isMobile());
debug("Firefox", isFirefox());
debug("IE", isIE());
debug("Chrome", isChrome());
debug("allowJqueryFX", allowJqueryFX());
debug("is FFMPEG enabled", isFfmpegEnabled());

debug();
debug("PATH");
debug("PHP_SELF", $_SERVER['PHP_SELF']);
debug("REQUEST_URI", $_SERVER['REQUEST_URI']);
debug("Current Url", currentUrl());
debug("Current Url dir", currentUrlDir());
debug("Current Script Url", currentScriptUrl());
debug("Current Script Name", currentScriptName());
debug("Current Script Path", currentScriptPath());
debug();

$url = "https://pimentdujour.com/api";
debug("toAbsoluteUrl $url", toAbsoluteUrl($url));
$url = "//pimentdujour.com/api";
debug("toAbsoluteUrl $url", toAbsoluteUrl($url));
$url = "//pimentdujour.com";
debug("toAbsoluteUrl $url", toAbsoluteUrl($url));
$url = "/api";
debug("toAbsoluteUrl $url", toAbsoluteUrl($url));
$url = "pdj/api";
debug("toAbsoluteUrl $url", toAbsoluteUrl($url));

$url = "../api";
debug("toAbsoluteUrl $url", toAbsoluteUrl($url));
$url = "./pdj/api";
debug("toAbsoluteUrl $url", toAbsoluteUrl($url));


debug();
debug("FILE",__FILE__);
debug("dirname",dirname(__FILE__));
debug("basename",basename(__FILE__));
debug();

$dir = $path;
debug("dirname $dir",dirname($dir));
$dir = dirname($dir);
debug("dirname $dir",dirname($dir));
$dir = dirname($dir);
debug("dirname $dir",dirname($dir));

$params = requestFilters(false);
debugVar("params");
$path=$params["path"];
$relPath=getRelPath($path);
debugVar("relPath");
debug("is_dir $relPath", is_dir($relPath));
$relPath=getDiskPath($path);
debugVar("relPath");
debug("is_dir $relPath", is_dir($relPath));

$absPath=diskPathToUrl($path);
debugVar("absPath");
debug("currentDir",realpath(""));
debug("relPath $relPath",realpath($relPath));

$image = getFileByName($relPath, $file);
debug("getFileByName $relPath $file", $image);

debug("App root", pathToAppRoot());
debug("App dir", getAppRootDir());
debug("Data root", pathToDataRoot());

debug("APP_ROOT",  getAppRoot() . " / " . getAbsoluteAppRoot() );
debug("DATA_ROOT", getDataRoot(). " / " . getAbsoluteDataRoot() );
debug("AbsoluteUrl", getAbsoluteUrl($path));
debug("DOCUMENT_ROOT",$_SERVER["DOCUMENT_ROOT"]);
debug("combine", combine(getAbsoluteDataRoot(), "..","2014/dir/file.jpg"));

debug("isDomainRoot '" . getAbsoluteAppRoot(), isDomainRoot(getAbsoluteAppRoot()));
debug("isDomainRoot '" . getAbsoluteDataRoot(), isDomainRoot(getAbsoluteDataRoot()));

$image = findFirstImage($relPath);
debug("findFirstImage $relPath", $image);
$imageUrl = getAbsoluteFileUrl($path, $image);
debug("getAbsoluteFileUrl", $imageUrl);

debug();
debug("SEARCH"); //file filters
$search =  array();
$search["type"]=getParam("type");
$search["name"]=getParam("name");
$search["depth"]=getParam("depth",0);
$search["count"]=getParam("count",0);
if(!is_numeric($search["depth"]))
	$search["depth"]=getParamBoolean("depth");
$search["tndir"]=getParam("tndir");
debugVar("search");

debug("publish", getConfig("_publish.free"));

debug("arrayJoinRecursive", arrayJoinRecursive($config["TYPES"]));
debug("FlattenArray", FlattenArray($config["TYPES"]["VIDEO"]));

debug("arraySearchRecursive:", arraySearchRecursive($config,"mpg"));
debug("arraySearchRecursive CSS,css:", arraySearchRecursive("CSS","css"));

debug("arrayGet", arrayGet($config,"TYPES.VIDEO"));

$tp="IMAGE|AUDIO";
debug("Extensions for types($tp)", getExtensionsForTypes($tp));

debug("isEmptyValue");
$value=array();
$empty=isEmptyValue($value);
debug(jsValue($value), $empty);

$value="";
$empty=isEmptyValue($value);
debug(jsValue($value), $empty);

$value=0;
$empty=isEmptyValue($value);
debug(jsValue($value), $empty);

$value=false;
$empty=isEmptyValue($value);
debug(jsValue($value), $empty);

$value=null;
$empty=isEmptyValue($value);
debug(jsValue($value), $empty);

$bg=findInParent($relPath,".bg.jpg");
debug("Background", $bg);
$stylesheet=findInParent($path,"night.css",true);
debug("Stylesheet", $stylesheet);
addStylesheet($relPath);
debug();

// $cmdOutput=shell_exec("dir ..\\$path");
// debug("command", $cmdOutput)";
startTimer();
$files = listAllFilesInDir($relPath);
debug("listAllFilesInDir $relPath Time", getTimer());
debug(count($files) . " files");
debugVar("files", true);

startTimer();
$files = scandir($relPath);
debug("scandir $relPath Time", getTimer());
debug(count($files) . " files");
debugVar("files", true);

startTimer();
$files = listFilesRecursive($relPath, $search);
debug("listFiles $relPath Time elapsed", getTimer());
debug(count($files) . " files");
debugVar("files", true);
startTimer();
$tagData = loadTagFiles($relPath, @$search["depth"]);
debugVar("tagData", true);

$winfiles = listFilesNTFS($relPath, true);
debug("listFilesNTFS $relPath Time elapsed", getTimerSinceLast());
debugVar("winfiles", true);

$winfiles = listHiddenFilesNTFS($relPath, true);
debug("listHiddenFilesNTFS $relPath Time elapsed", getTimerSinceLast());
debugVar("winfiles", true);

$files = array_values($files);
debugVar("files", true);
$fileDate = getFileDate(combine($relPath, $files[0]));
$mtm = strtotime($fileDate);
debugVar("fileDate");
debugVar("mtm");
$now=microtime(true);
debugVar("now");
$since = $now - $mtm;
debugVar("since");

//startTimer();
$dirs=selectDirs($relPath,$files);
debug("selectDirs Time elapsed", getTimer());
debugVar("dirs", true);

//startTimer();
$groupedFiles = groupByName($relPath, $files, $byType);
debug("groupByName Time elapsed", getTimer());

//startTimer();
//debugVar("groupedFiles", true);

$metadataIndex = getMetadataIndex($relPath, "VIDEO", @$groupedFiles["VIDEO"],true);
debugVar("metadataIndex", true);

$metadataIndex = getMetadataIndex($relPath, "IMAGE", @$groupedFiles["IMAGE"],true);
debugVar("metadataIndex", true);

if($metadataIndex)
{
	$metadataIndex = getMetadataIndex($relPath, "IMAGE");
	$metadata = array_shift($metadataIndex);
	debug("metadata", $metadata);
	addToMetadataIndex($relPath, "IMAGE", "test", $metadata);

	debug("AFTER");
	debug("readTextFile");
	debug(readTextFile(getMetadataIndexFilename($relPath, "IMAGE")));

	$metadataIndex = getMetadataIndex($relPath, "IMAGE", @$groupedFiles["IMAGE"],true);
	debugVar("metadataIndex", true);

}

$mf = MediaFile::getMediaFile();
debugVar("mf",true);
if($mf)
{
$tags = $mf->getTags();
debugVar("tags");
$tagsCsv = csvValue($tags);
debugVar("tagsCsv");
$tags = parseCsvTable($tagsCsv);
//$tags = explode(";", $tagsCsv);
debugVar("tags");
}

$indexFiles=selectFilesByType($files,"DIR|VIDEO|IMAGE");
debugVar("indexFiles",true);

//$dateIndex=getRefreshedDateIndex($relPath,$indexFiles);	
//debug("Files from $relPath date index", count($dateIndex));
//debugVar("dateIndex",true);
//debug("Constants: ", get_defined_constants(true), true);
$tn=getParam("tn");
if($tn && $dirs)
{
	debug("thumbnails in $tn");
	foreach($dirs as $dir)
	{
		debug("$relPath/$dir", subdirThumbs("$relPath/$dir",$tn));
	}
}

$t1 = getTimer();
debug("Time elapsed", getTimer());
//startTimer();

$appRootDir=pathToAppRoot();
$csvFilename=combine($appRootDir,"config","events.csv");
$csvData = readCsvTableFile($csvFilename);
debug("readCsvTableFile $csvFilename rows", count($csvData));
debugVar("csvData",true);

debug("Time elapsed", getTimer());
?> 
