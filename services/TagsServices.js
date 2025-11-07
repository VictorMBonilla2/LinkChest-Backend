import Tag from "../models/Tag.js";


export const validarTags = async (tagsList) => {
    const tagsId = [];

    if (!Array.isArray(tagsList) || tagsList.length === 0) {
        return { status: true, message: tagsId };
    }

    for (let tag of tagsList) {
        if (typeof tag !== "string") {
            return { status: false, message: `El tag "${tag}" no es válido` };
        }
        tag = tag.trim();
        if (tag.length > 10) {
            return { status: false, message: `El tag "${tag}" supera el límite de 10 caracteres` };
        }
    }

    for (let tag of tagsList) {
        const cleanTag = tag.trim().toLowerCase();

        let existe = await Tag.findOne({ name: cleanTag });
        if (existe) {
            tagsId.push(existe._id);
        } else {
            const newTag = await Tag.create({ name: cleanTag });
            tagsId.push(newTag._id);
        }
    }

    return { status: true, message: tagsId };
};
