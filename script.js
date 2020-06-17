const API = 'https://json.medrating.org/';

class Catalog {
    constructor(container) {
        this.dataUsers()
    }
    getUsers(url = 'users') {
        return fetch(API + url).then(data => data.json())
    }
    getAlbum(id, url = 'albums?userId=') {
        return fetch(API + url + id).then(data => data.json())
    }
    async dataUsers() {
        const response = await this.getUsers()

        response.forEach(el => {
            if (el.name) {
                this.renderUsers(el);
                this.dataAlbum(el.id);
            }
        })
    }
    async dataAlbum(data) {
        const response = await this.getAlbum(data)

        response.forEach(el => {
            this.renderAlbum(el)
        })
    }
    renderUsers(data) {
        const block = document.querySelector(".tabs__tree");

        let str = '';
        str += new UsersItem().render(data);
        block.insertAdjacentHTML('afterbegin', str);

        const name = document.querySelector('.name');

        name.addEventListener('click', this.clickUser);
    }
    renderAlbum(data) {
        const block = document.querySelectorAll(".tabs__album-list");

        block.forEach(el => {
            switch (el.dataset.id) {
                case `${data.userId}`:
                    let str = '';
                    str += new AlbumItem().render(data);
                    el.insertAdjacentHTML('afterbegin', str);

                    const blockAlbum = document.querySelector('.tabs__album');

                    blockAlbum.addEventListener('click', this.renderPhoto);
                    break;
            }
        })
    }
    async renderPhoto(e) {

        const ul = e.currentTarget.querySelector('ul');

        const id = e.target.dataset.albumid;

        if (ul.querySelector('li') && e.target.classList.contains('show')) {
            while (ul.firstChild) {
                ul.removeChild(ul.firstChild);
            }
        } else {

            const response = await fetch(API + 'photos?albumId=' + id)

            const data = await response.json()

            data.forEach(el => {
                let str = '';
                str += new PhotoItem().render(el);
                ul.insertAdjacentHTML('afterbegin', str);

                const tabStar = document.querySelector('.tabs__star');

                if (localStorage[el.id]) {
                    tabStar.classList.add('tabs__star_clicked');
                }
                tabStar.addEventListener('click', (e) => {
                    if (localStorage[el.id]) {
                        delete localStorage[el.id]
                    } else {
                        let dataStar = JSON.stringify(el);
                        let dataStarId = JSON.stringify(el.id);
                        localStorage.setItem(dataStarId, dataStar);
                    }
                    tabStar.classList.toggle('tabs__star_clicked');
                });
                ul.querySelector('img').addEventListener('click', () => {

                    const str = new Modal().render(el.url);

                    document.body.insertAdjacentHTML('beforeend', str);

                    const modal = document.querySelector('.modal');

                    modal.querySelector('.modal__bg').addEventListener('click', () => {
                        modal.remove();
                    });
                })
            })
        }
    }
    clickUser(e) {

        const ul = e.target.nextSibling.nextSibling;

        ul.classList.toggle('vision');
    }
}
class Favorites {
    constructor() {
        this.render();
    }
    render(e) {

        const block = document.querySelector(".tabs__save-list");

        block.innerHTML = '';
        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            let str = '';
            str += new PhotoItem().render(JSON.parse(localStorage[key]))
            block.insertAdjacentHTML('afterbegin', str);

            const tabStar = block.querySelector('.tabs__star');

            tabStar.classList.add('tabs__star_clicked');
            //навешивание события на звезду            
            tabStar.addEventListener('click', (e) => {

                const id = e.target.dataset.id;

                if (localStorage[id]) {
                    delete localStorage[id]
                    e.target.classList.toggle('tabs__star_clicked');
                    this.render();
                }
            });
            //навешивание события на img
            block.querySelector('img').addEventListener('click', () => {

                const data = JSON.parse(localStorage[key]);

                const str = new Modal().render(data.url);

                document.body.insertAdjacentHTML('beforeend', str);

                const modal = document.querySelector('.modal');

                modal.querySelector('.modal__bg').addEventListener('click', () => {
                    modal.remove();
                });
            })
        }
    }
}
class UsersItem {
    render(data) {
        return `<li class="tabs__user">
                    <span class="show name" data-id="${data.id}">${data.name}</span> 
                    <ul class="tabs__album-list" data-id="${data.id}">
                    </ul>                   
                </li>`
    }
}
class AlbumItem {
    render(data) {
        return `<li class="tabs__album" >
                    <span class="show" class="album" data-userId="${data.userId}" data-albumId="${data.id}">${data.title}</span>                            
                    <ul class="tabs__photos-list">
                    </ul>
                </li>`
    }
}
class PhotoItem {
    render(data) {
        return `<li class="tabs__photo">
                    <img src="${data.thumbnailUrl}" title="${data.title}" class="tabs__image">
                    <span class="tabs__star" data-id="${data.id}"></span>
                </li>`
    }
}
class Modal {
    render(data) {
        return `<div class="modal">
                    <img class="modal__img" src="${data}" alt="">
                    <div class="modal__bg"></div>
                </div> `
    }
}
class TabList {
    constructor() {
        this.clickTitlePage();
    }
    clickTitlePage() {

        const tabTitle = document.querySelectorAll('.headers__tab-item');

        const tabCatalog = document.querySelector('.tab-1');

        const tabFavorites = document.querySelector('.tab-2');

        tabTitle[0].addEventListener('click', () => {

            const ul = tabCatalog.querySelectorAll('.tabs__photos-list');

            for (let i = 0; i < ul.length; i++) {
                while (ul[i].firstChild) {
                    ul[i].removeChild(ul[i].firstChild);
                }
            }
            tabCatalog.classList.add('active')
            tabFavorites.classList.remove('active')
        })
        tabTitle[1].addEventListener('click', () => {
            tabFavorites.classList.add('active')
            tabCatalog.classList.remove('active')
            new Favorites();
        })
    }
}

document.addEventListener("DOMContentLoaded", () => {
    localStorage.clear();
    new Catalog();
    new TabList();
})