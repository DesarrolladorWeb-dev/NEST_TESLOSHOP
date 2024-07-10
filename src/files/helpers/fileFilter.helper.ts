

export const fileFilter = (req:Express.Request, file: Express.Multer.File , callback:Function) => {
    // console.log({file}) //de esta maneras vemos si pasa por interceptor
    // Si no enviamos el archivo
    if(!file) return callback(new Error('File is empty'),false); //el false es que no aceptamos el archivo

    // mimetype que tipo de archivo es
    const fileExptension = file.mimetype.split('/')[1] //aqui tenemos la extencion
    const validExtension = ['jpg', 'jpeg','png','gif'];

    if(validExtension.includes(fileExptension)){
        return callback(null, true)
    }   

    callback(null, false); //cuando el CALLBACK reciba un false ya no va a seguir - es para que ya no lo permita como validacion

}