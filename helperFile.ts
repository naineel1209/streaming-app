import fs from "fs/promises";

async function changeName(): Promise<void> {
  const files = await fs.readdir("./assets");
  let i = 0;

  for (const file of files) {
    const split = file.split(".");
    const extension = split[split.length - 1];
    const newName = `assets_${++i}.${extension}`;

    await fs.rename('./assets/' + file, './assets/' + newName);
  }

  console.log("Files renamed");
}

async function removeUnextensibleFiles(): Promise<void> {
  const files = await fs.readdir("./assets");

  for (const file of files) {
    if (file.split(".")[1] != "mp4" || file.split(".")[1] != "mp3" || file.split(".")[1] != "mkv") {
      await fs.unlink('./assets/' + file);
    }
  }

  console.log("Files removed");
}

changeName();