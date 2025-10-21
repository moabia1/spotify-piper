import { uploadFile,getPresignedUrl } from "../services/storage.service.js";
import musicModel from "../models/music.model.js"



export async function uploadMusic(req,res) {
  const musicFile = req.files['music'][0];
  const coverImageFile = req.files['coverImageFile'][0];

  try {
    const musicKey = await uploadFile(musicFile);
    const coverImageKey = await uploadFile(coverImageFile);

    const music = await musicModel.create({
      title: req.body.title,
      artist: req.user.fullName.firstName + " " + req.user.fullName.lastName,
      artistId: req.user.id,
      musicKey,
      coverImageKey
    })

    return res.status(201).json({
      message: "Music Created Successfully",
      music
    })
  } catch (error) {
    console.log("Upload Music Error: ", error)
    return res.status(500).json({message: "Internal Server error"})
  }
}

export async function getArtistMusics(req, res) {
  try {
    const musics = await musicModel.find({ artistId: req.user.id }).lean();

    for (let music of musics) {
      music.musicUrl = await getPresignedUrl(music.musicKey);
      music.coverImageUrl = await getPresignedUrl(music.coverImageKey)
    }
    return res.status(200).json({musics})
  } catch (error) {
    console.log("GetArtistMusic Error: ",error)
  }
}