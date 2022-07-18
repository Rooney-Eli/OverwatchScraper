function onOpen() {
  const ui = SpreadsheetApp.getUi()
  ui.createMenu('Hero-list')
    .addItem('Load Hero Data', 'loadHeroData')
    .addToUi()
}


function loadHeroData() {
    const url = 'https://www.overbuff.com/players/pc/LastMiss-1782'
    const html = UrlFetchApp.fetch(url).getContentText()

    const sheet = SpreadsheetApp.getActiveSpreadsheet()
    const heroData = parseHTML(html)


    const startRowOffset = 2
    var currentRow = 0

    const heroHeader = Hero.getHeader()
    for(let i = 0; i < heroHeader.length - 1; i++) {
        sheet
          .getRange(`R${currentRow + startRowOffset}C${i+1}:R${currentRow + startRowOffset}C${i+1}`)
          .setValue(heroHeader[i])
    }
    currentRow += 1
    
    heroData.forEach(hero => {
      for(let i = 0; i < 7; i++) {
        sheet
          .getRange(`R${currentRow + startRowOffset}C${i+1}:R${currentRow + startRowOffset}C${i+1}`)
          .setValue(hero.toArray()[i])
      }
      currentRow += 1
    }) 
}


class Hero {

    constructor(name, medals, eliminations, objectiveKills, objectiveTime, damage, deaths) {
      this.name = name
      this.medals = medals
      this.eliminations = eliminations
      this.objectiveKills = objectiveKills
      this.objectiveTime = objectiveTime
      this.damage = damage
      this.deaths = deaths
    }

    toString() {
        return `Name: ${this.name}\n`+
                `Medals: ${this.medals}\n`+
                `Eliminations: ${this.eliminations}\n`+
                `Objective Kills: ${this.objectiveKills}\n`+
                `Objective Time: ${this.objectiveTime}\n`+
                `Damage: ${this.damage}\n`+
                `Deaths: ${this.deaths}\n`
    }

    static getHeader() {
      return ["Name", "Medals", "Eliminations", "Objective Kills", "Objective Time", "Damage", "Deaths"]
    }

    toArray() {
      return [
        this.name,
        this.medals,
        this.eliminations,
        this.objectiveKills,
        this.objectiveTime,
        this.damage,
        this.deaths
      ]
    }
}

function parseHTML(html) {
  const heroesSelector = 'body > div > div.container.main > div > div > div.row.with-sidebar > div.columns.eight > section > article > div.player-heroes'
    const $ = Cheerio.load(html)

    const collection = $(heroesSelector).children().map((_, hero) => {
        const name = getHeroName(hero)
        const medals = getMedals(hero)
        const eliminations = getEliminations(hero)
        const objectiveKills = getObjectiveKills(hero)
        const objectiveTime = getObjectiveTime(hero)
        const damage = getDamage(hero)
        const deaths = getDeaths(hero)

        return new Hero(name, medals, eliminations, objectiveKills, objectiveTime, damage, deaths)
    }).get()

    function getHeroName(hero) {
        const nameSelector = 'div.player-hero.theme-hero > div.grouping.header > div.group.normal > div.name > a'
        return $(hero).find(nameSelector)[0].children[0].data
    }

    function getMedals(hero) {
        const medalSelector = 'div:nth-child(2) > div.group.normal > div > div.value'
        return $(hero).find(medalSelector)[0].children[0].data
    }

    function getEliminations(hero) {
        const eliminationSelector = 'div:nth-child(3) > div.group.normal.h-separator.separator > div:nth-child(1) > div.value'
        return $(hero).find(eliminationSelector)[0].children[0].data
    }

    function getObjectiveKills(hero) {
        const eliminationSelector = 'div:nth-child(3) > div.group.normal.h-separator.separator > div:nth-child(2) > div.value'
        return $(hero).find(eliminationSelector)[0].children[0].data
    }

    function getObjectiveTime(hero) {
        const eliminationSelector = 'div:nth-child(3) > div.group.normal.h-separator.separator > div:nth-child(3) > div.value'
        return $(hero).find(eliminationSelector)[0].children[0].data
    }

    function getDamage(hero) {
        const eliminationSelector = 'div:nth-child(3) > div.group.normal.h-separator.separator > div:nth-child(4) > div.value'
        return $(hero).find(eliminationSelector)[0].children[0].data
    }

    function getDeaths(hero) {
        const eliminationSelector = 'div:nth-child(3) > div.group.normal.h-separator.separator > div:nth-child(5) > div.value'
        return $(hero).find(eliminationSelector)[0].children[0].data
    }

    return collection
}