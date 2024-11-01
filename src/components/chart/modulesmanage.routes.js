const multer = require('multer');
const fs = require('fs');
const path = require('path');
// const upload = multer({ dest: 'uploads/' });
const { exec } = require('child_process');
// 配置Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const fileNameWithoutExtension = file.originalname.split('.');
    if (file.originalname.indexOf('.fbx') != -1 || file.originalname.indexOf('.FBX') != -1) {
      cb(null, decodeURIComponent(fileNameWithoutExtension[0]) + '_' + Date.now() + '.' + fileNameWithoutExtension[1]);
    } else if (file.fieldname == 'resourcesImgsOriginal') {
      cb(null, decodeURIComponent(fileNameWithoutExtension[0]) + '.' + fileNameWithoutExtension[1])
    } else {
      cb(null, decodeURIComponent(fileNameWithoutExtension[0]) + '_' + Date.now() + '.' + fileNameWithoutExtension[1])
    }
  }
});
// const upload = multer({ storage: storage });
const upload = multer({
  storage: storage, fileFilter: function (req, file, cb) {
    if (file.originalname.indexOf('.fbx') != -1 || file.originalname.indexOf('.FBX') != -1) {
      req.isFBX = true;
    } else {
      req.isFBX = false;
    }
    cb(null, true);
  },
  limits: { fileSize: Infinity }
});
module.exports = app => {
  const modulesmanage = require("../controllers/modulesmanage.controller.js");

  var router = require("express").Router();

  router.get("/get_moudel_list", modulesmanage.get_moudel_list);// 获取当前人物子模组特征清单

  router.get("/detele_people_item", modulesmanage.detele_people_item)

  router.post("/add_moudel_list", upload.single('file'), modulesmanage.add_moudel_list)

  router.post("/insert_moudel_list", modulesmanage.insert_moudel_list);//添加人物子模组特征清单

  router.get("/delete_moudel_itemAll", modulesmanage.delete_moudel_itemAll)

  router.get("/get_moudel_items", modulesmanage.get_moudel_items); //获取子模组内对象清单

  router.post("/allToysTypeClothesList", modulesmanage.allToysTypeClothesList); //

  // router.post("/add_moudel_item", upload.fields([{ name: 'fbxFile' }, { name: 'bitmapFiles' }]), modulesmanage.add_moudel_item); //添加/编辑子模组内对象
  router.post("/sendNowModel", upload.single('resourcesImgsOriginal'), modulesmanage.sendNowModel);//查询大分类

  router.post("/add_moudel_item", upload.fields([{ name: 'fbxFile' }, { name: 'bitmapFiles' }, { name: 'resourcesImgsOriginal' }]), async (req, res) => {
    if (req.isFBX || (req.files.fbxFile && req.files.fbxFile.length)) {
      let { filename } = req.files.fbxFile[0]
      const fbxFilePath = `./uploads/${filename}`;
      const glbFileName = filename.replace('.fbx', '.glb').replace('.FBX', '.glb');
      const glbFilePath = `./uploads/${filename.replace('.fbx', '.glb')}`;
      const fbx2gltfPath = path.join(__dirname, '..', '..', 'node_modules', 'fbx2gltf', 'bin', 'Windows_NT', 'FBX2glTF');

      const inputPath = path.join(__dirname, '..', '..', 'uploads', filename).replace(/\\/g, '/');
      const outputPath = path.join(__dirname, '..', '..', 'uploads', glbFileName).replace(/\\/g, '/');
      const command = `${fbx2gltfPath} -i "${inputPath}" -o "${outputPath}"`;

      // 转换为 GLB 文件
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error converting to GLB: ${error}`);
          return;
        }
        // const compressedGlbFilePath = path.join(outputDir, glbFileName);
        const compressCommand = `gltf-pipeline -i "${outputPath}" -o "${outputPath}" -d`;
        exec(compressCommand, (compressError, compressStdout, compressStderr) => {
          if (compressError) {
            console.error(`Error compressing GLB file: ${compressError}`);
            return res.status(500).send(compressStderr);
          }
          // 删除临时文件
          // fs.unlinkSync(inputPath);
          // fs.unlinkSync(glbFilePath);
        });
      });
    }
    modulesmanage.add_moudel_item(req, res)

  }); //添加/编辑子模组内对象


  router.get("/delete_moudel_item", modulesmanage.delete_moudel_item); //删除子模组内对象

  router.post("/modulesItemManageObj", modulesmanage.modulesItemManageObj); //删除子模组内对象  appAllClothesModelObj

  router.get("/appAllClothesModelObj", modulesmanage.appAllClothesModelObj);

  router.get("/jsonDataAllClothesInfoList", modulesmanage.jsonDataAllClothesInfoList);


  app.use('/api/modulesmanage', router);
};
