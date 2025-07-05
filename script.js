async function getData() {
    return fetch('./data.json').then(res => res.json())
}

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
 * @typedef {Object} Group
 * @property {string} name
 * @property {Member[]} chiefs
 * @property {Member[]} members
 *
 */

/**
 * @param {Group} group
 * @returns {HTMLElement[]}
 */
function Group(group) {
    const s = document.createElement('div')
    s.classList.add('slide')

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

    const members = document.createElement('div')
    members.classList.add('members')
    membersList.forEach(({ member, isChief }) => {
        members.appendChild(Member(member, isChief))
    })

    s.appendChild(title)
    s.appendChild(members)

    return [s]
}

async function main() {
    data = await getData()

    const container = document.querySelector('#screen')

    container.appendChild(Group(data.data[0])[0])

    console.log(data.data[0].members)
}

main()
