<?php
// media file, 1 per name
class MediaFile extends BaseObject
{
    private $id;
    private $_dirPath;
    private $name;
    private $filename;
    private $subdir;
	private $type;
    private $title;
    private $description;
    private $takenDate;
    private $cDate;
    protected $animated;
    private $mDate;
    private $metadata;
    private $oldestDate;
    private $newestDate;
	private $exts=array();		//array of extensions available for this filename
	private $versions=array(); //array of MediaFileVersion in the same dir with different extensions
	private $_thumbnails=array(); //array of MediaFileVersion thumbnail images in different subdirectories
	private $tnsizes=array(); //array of thumbnail file sizes
	private $vsizes=array(); //array of thumbnail file sizes
    protected $format;
    protected $width;
    protected $height;
    protected $ratio;

    public function __construct($album, $file, $subdir=null, $exts=null, $id=null)
	{
		if(is_array($file))
		{
			$this->constructFromArray($album,$file);
			return;
		}
		$this->_parent=$album;
		$this->subdir=$subdir;
		$this->id = $id;
		//$this->filename=$file;
		if(!$exts) 
		{
			splitFilename($file, $this->name, $ext);
			$exts=$ext;
		}
		else
			$this->name=$file;

		if(!is_array($exts))
			$exts=array($exts);

		foreach($exts as $ext)
			$this->addVersion("", $ext);

//		$this->getFilename();
			
		$this->title = makeTitle($this->name);
		$this->_dirPath = $this->getFilePath();
		$this->type=getFileType($this->_dirPath);
		$this->getDescription();
		$this->getTakenDate();
		if($this->type=="DIR")
		{
			$this->oldestDate=getOldestFileDate($this->_dirPath);
			$this->newestDate=getNewestFileDate($this->_dirPath);
			$this->takenDate=$this->newestDate; 
			$this->thumbnails=subdirThumbs($this->_dirPath, 4);
		}
		else if($this->type=="IMAGE")
		{
			$this->getImageInfo();
			//thumbnails: image: .tn & .ss, same ext.
			$this->addImageThumbnails();
		}
		else if ($this->type=="VIDEO")
		{
			//thumbnails: video: .tn/.jpg
			$this->addThumbnail("tn","jpg");
			if($this->_thumbnails[0]->exists)
			{
				$tnPath = $this->_thumbnails[0]->getFilePath();
				$this->getImageInfo($tnPath);
			}
			$this->addThumbnail("ss", "jpg");
			if(!$this->_thumbnails[1]->exists && !isFfmpegEnabled())
				unset($this->tnsizes[1]);
//				$this->getMetadata();
		}
    }

    public function constructFromArray($album, $file)
	{
		$this->_parent=$album;
		foreach ($file as $key => $value)
			$this->$key = $value;

		foreach($this->exts as $ext)
			$this->addVersion("", $ext);

		$this->title = makeTitle($this->name);
		$this->_dirPath = $this->getFilePath();
		$this->getDescription();
		$this->getTakenDate();

		if($this->type=="DIR")
		{
			$this->oldestDate=getOldestFileDate($this->_dirPath);
			$this->newestDate=getNewestFileDate($this->_dirPath);
			$this->takenDate=$this->newestDate;
			$this->thumbnails=subdirThumbs($this->_dirPath, 4);
		}
		else if($this->type=="IMAGE")
		{
			$this->getImageInfo();
			//thumbnails: image: .tn & .ss, same ext.
			$this->addImageThumbnails();
		}
		else if ($this->type=="VIDEO")
		{
			//thumbnails: video: .tn/.jpg
			$this->addThumbnail("tn","jpg");
			if($this->_thumbnails[0]->exists)
			{
				$tnPath = $this->_thumbnails[0]->getFilePath();
				$this->getImageInfo($tnPath);
			}
			$this->addThumbnail("ss", "jpg");
			if(!$this->_thumbnails[1]->exists && !isFfmpegEnabled())
				unset($this->tnsizes[1]);
//				$this->getMetadata();
		}

	}

    public function addImageThumbnails($ext="")
    {
    	$tnSizes = getConfig("thumbnails.sizes"); 
    	if(!$tnSizes) return;
    	foreach ($tnSizes as $subdir => $size)
    	{
    		if($this->animated && $this->width <= $size && $this->height <= $size) break;
			debug("addImageThubnails $subdir $size", $this->width . "x" . $this->height);
 			$this->addThumbnail($subdir, $ext);
//    		if($this->width < $size && $this->height < $size) break;
    	}
    	debug("tnsizes", $this->tnsizes);
    }

	public function getName()
	{
		return $this->name;
	}
	
	public function getSubdir()
	{
		return $this->subdir;
	}
	
	public function getRelPath()
	{
		if($this->_parent)
			return $this->_parent->getRelPath();
		return "";
	}

    public function getTakenDate()
	{
		$dateIndex = $this->_parent->getDateIndex();
		if(!$this->takenDate)
			$this->takenDate = coalesce(@$dateIndex[$this->name], getFileDate($this->_dirPath));
		return $this->takenDate;
	}

    public function getExtension($i=0)
	{
		if($this->exts && isset($this->exts[$i]))
			return $this->exts[$i];
		return "";
	}

    public function getFilename($i=0)
	{
		$ext=$this->getExtension($i);
		$this->filename = $ext ? $this->name.".$ext" : $this->name;
		return $this->filename;
	}

    public function getFilePath($ext=0)
	{
		return combine($this->getRelPath(), $this->subdir, $this->getFilename($ext));
	}

//return original file names, thubmnails, metadata, description
    public function getFilenames()
	{
		$filenames=array();
		foreach($this->exts as $ext)
			$filenames[] = $this->getFilename($ext);
		$filenames[] = getMetadataFilename($this->name);

		return $filenames;
	}
 
//return original file name, thubmnails, metadata, description
    public function getFilePaths()
	{
		$filenames=array();
		if($this->exts)
			foreach($this->exts as $ext)
				$filenames[] = $this->getFilePath($ext);
		else //if no ext: just filename
			$filenames[] = $this->getFilePath();
//add metadata
		$filenames[] = combine($this->getRelPath(), $this->subdir, getMetadataFilename($this->name));

//add thumbnails
		
		return $filenames;
	}

//return original file name, thubmnails, metadata, description + urlPaths
    public function getFileUrls()
	{
	}

	public function getDescriptionFilePath()
	{
		if($this->type=="DIR")
				return combine($this->getFilePath(),"readme.txt");
		return combine($this->getRelPath(),$this->subdir, $this->name . ".txt");
	}
	
    public function getDescription()
	{
		$this->description=readTextFile($this->getDescriptionFilePath());
		return $this->description;
	}
	
    public function getMetadata()
	{
		$this->metadata=getMediaFileInfo($this->_dirPath);
		return $this->metadata;
	}

    public function getImageInfo($filePath="")
	{
		if(!$filePath) $filePath = $this->_dirPath; 
		$info = getImageInfo($filePath, true);
		//$this->metadata = $info;
		$this->setMultiple($info);
		return $info;
	}

    public function isAnimated($ext)
	{
		if(!equals($ext,"GIF")) return false;

		$this->frames = countAnimatedGifFrames($this->_dirPath);
		$this->animated = ($this->frames > 1);
		
		return $this->frames;
	}

    public function isTransparent($ext)
	{
		$this->transparent = false; 
		$this->transparent = hasTransparentColor($this->_dirPath, $ext);
//debug($this->name . " is transparent", $this->transparent);
		return $this->transparent;
	}

    public function isAlpha($ext)
	{
		$this->alpha = false; 
		$this->alpha = hasAlphaPixels($this->_dirPath, $ext);
//debug($this->name . " is transparent", $this->transparent);
		return $this->alpha;
	}
	
    public function addVersion($subdir="",$ext="")
	{
//		$this->exts[]=$ext;
		$mf=new MediaFileVersion($this,$subdir,$ext,true);
//		$this->versions[]= $mf;
		$this->vsizes[$ext] = $mf->getSize();
	}
	
    public function addThumbnail($subdir="",$ext="")
	{
		$mf = new MediaFileVersion($this,$subdir,$ext,true);
		$this->_thumbnails[] = $mf;
		$this->tnsizes[] = $mf->getSize();
    }
	
    public function test()
	{
		print_r($this);
		print_r($this->versions[0]);
		echo $this->path ." ".	$this->filename . " " . $this->takenDate . "\n";
    }
}

//1 version of a file: extension or thumbnail
class MediaFileVersion extends BaseObject
{
	private $mediaFile;
	private $ext="";
	private $subdir="";
    public $exists=false;
    private $cDate;
    private $mDate;
    private $size;
	
	public function __construct($mediaFile, $subdir, $ext="", $details=false)
	{
debug("new MediaFileVersion $subdir", $ext);
		$this->_parent=$mediaFile;

		if($subdir)	$this->subdir=$subdir;
		if($ext)	$this->ext=$ext;

debug("getExtension", $this->getExtension());
debug("getExtension parent", $this->_parent->getExtension());
debug("getFilename", $this->getFilename());

		$filePath=$this->getFilePath();
		$this->_filePath=$filePath;
		$this->exists=file_exists($filePath);
		$this->getSize();
		if($this->exists && $details)
		{
			$this->size=filesize($filePath);
			$this->mDate=formatDate(filemtime($filePath));
			$this->cDate=formatDate(filectime($filePath));
		}
	}

    public function getFilename()
	{
		return $this->_parent->getName() . "." . $this->getExtension();
	}

    public function getSize()
	{
		if(!$this->size)
			$this->size = file_exists($this->_filePath) ? filesize($this->_filePath) : -1;
		return $this->size;
	}

    public function getExtension()
	{
		if($this->ext) return $this->ext;
		return $this->_parent->getExtension();
	}

    public function getFilePath()
	{
		return combine($this->_parent->getRelPath(), $this->_parent->getSubdir(), "." . $this->subdir, $this->getFilename());
	}
	
}

?>