export const ERA_POSTERS = Object.freeze({
  poster_01_restraint_sop: Object.freeze({
    id:'poster_01_restraint_sop',
    title:'精神科急性病房保護性約束作業指引',
    shortTitle:'保護性約束 SOP',
    category:'AMBIGUOUS',
    displayTexture:'assets/posters/era/display/poster_01_restraint_sop.webp',
    inspectTexture:'assets/posters/era/inspect/poster_01_restraint_sop.webp',
    inspectable:true,
    commentary:'「規範寫得很正常，但那些手寫警語像是後來有人故意補上去的。」',
    tags:['restraint','ward','institution','patientization']
  }),
  poster_02_auditory_hallucination_knocking: Object.freeze({
    id:'poster_02_auditory_hallucination_knocking',
    title:'聽見不存在的聲音？談談複雜幻聽與敲牆',
    shortTitle:'複雜性幻聽與敲牆',
    category:'TRUE_CLUE',
    displayTexture:'assets/posters/era/display/poster_02_auditory_hallucination_knocking.webp',
    inspectTexture:'assets/posters/era/inspect/poster_02_auditory_hallucination_knocking.webp',
    inspectable:true,
    commentary:'「敲牆被當成症狀紀錄……可 408C 聽見的節奏，根本像是有人在傳訊息。」',
    tags:['408C','0409','knocking','ward']
  }),
  poster_03_doppelganger_delusion: Object.freeze({
    id:'poster_03_doppelganger_delusion',
    title:'「身邊的人被換包了？」談替身妄想症',
    shortTitle:'替身妄想症',
    category:'FALSE_CLUE',
    displayTexture:'assets/posters/era/display/poster_03_doppelganger_delusion.webp',
    inspectTexture:'assets/posters/era/inspect/poster_03_doppelganger_delusion.webp',
    inspectable:true,
    commentary:'「把『看到另一個自己』寫成症狀，倒是很方便。」',
    tags:['doppelganger','identity','misdirection']
  }),
  poster_04_hospital_history_1998: Object.freeze({
    id:'poster_04_hospital_history_1998',
    title:'半世紀精神醫療沿革與重大事件',
    shortTitle:'院史大事紀',
    category:'TRUE_CLUE',
    displayTexture:'assets/posters/era/display/poster_04_hospital_history_1998.webp',
    inspectTexture:'assets/posters/era/inspect/poster_04_hospital_history_1998.webp',
    inspectable:true,
    commentary:'「這張院史把 1998 圈得太刻意了，像故意要人看到。」',
    tags:['1998','history','b2','timeline']
  }),
  poster_05_derealization_dissociation: Object.freeze({
    id:'poster_05_derealization_dissociation',
    title:'熟悉的空間突然變形？談現實感喪失與解離',
    shortTitle:'現實感喪失與解離須知',
    category:'AMBIGUOUS',
    displayTexture:'assets/posters/era/display/poster_05_derealization_dissociation.webp',
    inspectTexture:'assets/posters/era/inspect/poster_05_derealization_dissociation.webp',
    inspectable:true,
    commentary:'「如果連空間本身都不可信，這張衛教是在提醒病人，還是在提醒值班的人？」',
    tags:['dissociation','skybridge','space']
  }),
  poster_06_night_shift_attendance: Object.freeze({
    id:'poster_06_night_shift_attendance',
    title:'精神科夜間醫療值班與差勤登錄管理辦法',
    shortTitle:'夜間值班與差勤登錄規範',
    category:'TRUE_CLUE',
    displayTexture:'assets/posters/era/display/poster_06_night_shift_attendance.webp',
    inspectTexture:'assets/posters/era/inspect/poster_06_night_shift_attendance.webp',
    inspectable:true,
    commentary:'「夜間值班、差勤補登、責任歸屬……這些規則像在等某個人被補進去。」',
    tags:['2117','316','duty','attendance','identity']
  }),
  poster_07_ect_identity_memory: Object.freeze({
    id:'poster_07_ect_identity_memory',
    title:'電氣痙攣治療（ECT）安全須知與記憶監測',
    shortTitle:'ECT 與失憶身分須知',
    category:'AMBIGUOUS',
    displayTexture:'assets/posters/era/display/poster_07_ect_identity_memory.webp',
    inspectTexture:'assets/posters/era/inspect/poster_07_ect_identity_memory.webp',
    inspectable:true,
    commentary:'「記憶混亂被寫得像普通副作用；可這裡連名字都可能被換掉。」',
    tags:['ect','memory','identity','4f']
  }),
  poster_08_er_jane_doe_triage: Object.freeze({
    id:'poster_08_er_jane_doe_triage',
    title:'精神科急診危險個案與無身分者高危指引',
    shortTitle:'急診無名氏檢傷與高危通報',
    category:'TRUE_CLUE',
    displayTexture:'assets/posters/era/display/poster_08_er_jane_doe_triage.webp',
    inspectTexture:'assets/posters/era/inspect/poster_08_er_jane_doe_triage.webp',
    inspectable:true,
    commentary:'「無名氏高危通報……怎麼像是在替某個『找不到的人』預留位置？」',
    tags:['jane_doe','0033','er','1998-ER-0217']
  })
});

export function getEraPoster(id){ return ERA_POSTERS[id] || null; }
