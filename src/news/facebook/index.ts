import {getPagePosts} from "./fb-api";

export const facebook = {
    async getNews() {
        return await getPagePosts('kolejni.rada.koleje.Kajetanka');
    }
};
