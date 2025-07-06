'use strict'
import { createTimeline } from 'https://cdn.jsdelivr.net/npm/animejs/+esm'

/**
 * @typedef {Object} Member
 * @property {string} name
 * @property {string} email_hash
 */

/**
 * @param {Member} member
 * @param {boolean} [isCheif=false]
 */
function Member(member, isCheif = false) {
    const m = document.createElement('div')
    m.classList.add('member')

    const avatar = document.createElement('img')
    avatar.src = `https://www.gravatar.com/avatar/${member.email_hash}?s=120&d=identicon&r=g&d=https://volunteer.coscup.org/img/nonavatar.png`
    avatar.alt = member.name
    avatar.height = 120
    avatar.width = 120

    const title = document.createElement('h3')
    title.textContent = isCheif ? '組長' : '　'

    const name = document.createElement('h2')
    name.textContent = member.name

    m.appendChild(avatar)
    m.appendChild(title)
    m.appendChild(name)

    return m
}

/**
 * @param {Array} arr - The array to be chunked
 * @param {number} [n=1] - The size of each chunk
 */
function chunk(arr, n = 1) {
    if (!Array.isArray(arr)) {
        throw new Error('Invalid input: arr must be an array.')
    }
    if (n <= 0) {
        throw new Error('Invalid input: n must be a positive integer.')
    }

    const result = []
    for (let i = 0; i < arr.length; i += n) {
        result.push(arr.slice(i, i + n))
    }
    return result
}

/**
 * @typedef {Object} Group
 * @property {string} name
 * @property {Member[]} chiefs
 * @property {Member[]} members
 *
 */

/**
 * @param {Group} group
 * @param {number} n - How many group members in one slide
 */
function Group(group, n) {
    // const s = document.createElement('div')
    // s.classList.add('slide')

    const title = document.createElement('h1')
    title.textContent = group.name

    /** @type {Set<string>} */
    const cheifs = new Set()
    group.chiefs.forEach(chief => {
        cheifs.add(chief.email_hash)
    })

    /** @type {{member: Member, isChief: boolean}[]} */
    const membersList = [
        ...group.chiefs.map(c => ({ member: c, isChief: true })),
        ...group.members.filter(m => !cheifs.has(m.email_hash)).map(m => ({ member: m, isChief: false })),
    ]

    const chunkedMembers = chunk(membersList, n || 1)

    const members = chunkedMembers.map(c => {
        const m = document.createElement('div')
        m.classList.add('members')
        c.forEach(({ member, isChief }) => {
            m.appendChild(Member(member, isChief))
        })
        return m
    })

    return {
        title,
        members,
    }
}

function slideInGroup(tl, group) {
    const titleContainer = document.querySelector('#title')
    const membersContainer = document.querySelector('#members')

    // TODO: decide n by the width of #screen
    const { title, members } = Group(group, 6)

    titleContainer.appendChild(title)
    members.forEach(m => {
        membersContainer.appendChild(m)
    })

    const speed = 600 / 1000 // px/ms

    const width = membersContainer.offsetWidth
    const duration = width / speed

    const slidein = {
        translateX: {
            from: width,
            to: 0,
            duration: duration,
            ease: 'linear',
        },
    }

    const slideout = {
        delay: 1000,
        translateX: {
            from: 0,
            to: -width,
            duration: duration,
            ease: 'linear',
        },
    }

    tl.add(title, slidein, '<<')

    members.forEach(m => tl.add(m, slidein, '<<').add(m, slideout))

    tl.add(title, slideout, '<<')

    return tl
}

// TODO: jump to specific group, seek by progress
function controlPanel(tl) {
    const pause = () => {
        if (tl.paused) {
            tl.play()
        } else {
            tl.pause()
        }
    }

    const restart = () => tl.restart()

    document.querySelector('#pause').addEventListener('click', pause)
    document.querySelector('#restart').addEventListener('click', restart)
    document.addEventListener('keydown', e => {
        console.log(e.code)
        switch (e.code) {
            case 'space':
                pause()
                break
            case 'keyR':
                restart()
                break
        }
    })
}

async function main() {
    const data = await fetch('./data.json')
        .then(res => res.json())
        .catch(err => console.error(err))

    const tl = createTimeline()

    for (const group of data.data) {
        slideInGroup(tl, group)
    }

    controlPanel(tl)
}

main()
