/* global $, color, main, mobileFlag, dir, transcripts, homeFlag, link
createIcon, createModal, toCase, addScripts, toTable, fromTable*/

// #region classes
/**
 * @class Name
 */
class Name {
  /**
   * Name class constructor
   * @param {string} first first name
   * @param {string} last last name
   */
  constructor(first = 'Arthur', last = 'Irving') {
    this.first = first;
    this.last = last;
  }
}

/**
 * @class Period
 */
class Period {
  /**
   * period constructor
   * @param {Date} start start Date
   * @param {Date} end end Date
   */
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

/**
 * @class Education
 */
class Education {
  /**
   *
   * @param {string} school school name
   * @param {string} id student id
   * @param {string} degree degree
   * @param {string} major major
   * @param {Period} period study period
   * @param {string} description description
   */
  constructor(school, id, degree, major, period, description) {
    this.school = school;
    this.id = id;
    this.degree = degree;
    this.major = major;
    this.period = period;
    this.length = this.period.end.getFullYear() -
    this.period.start.getFullYear();
    this.description = description;
  }
}

/**
 * @class Experience
 */
class Experience {
  /**
   * Experience constructor
   * @param {string} job job title
   * @param {string} company company name
   * @param {Period} period work time period
   * @param {string} description work description
   */
  constructor(job, company, period, description) {
    this.job = job;
    this.company = company;
    this.period = period;
    this.description = description;
  }
}

/**
 * @class Person
 */
class Person {
  /**
   * create Person object
   * @param {string} name name
   * @param {Date} birthday birthday
   * @param {string} sex sex
   * @param {string} address address
   * @param {string} email email
   * @param {string} phone phone number
   * @param {Education} education education background
   * @param {Experience} experience work experience
   * @param {array} skills skills
   */
  constructor(
      name = new Name,
      birthday = Date('1992-09-29'),
      sex = 'Male',
      address = 'San Francisco, US',
      email = 'example@mail.com',
      phone = '1800800800',
      education = [],
      experience = [],
      skills = [],
  ) {
    this.name = name;
    this.birthday = birthday;
    this.sex = sex;
    this.address = address;
    this.email = email;
    this.phone = phone;

    this.education = education;
    this.experience = experience;
    this.skills = skills;

    this.fullName = `${this.name.first} ${this.name.last}`;
  }
}
// #endregion classes

/**
 * add sectioin heading and icons based on heading
 * @param {string} title section title
 * @param {string} src section icon source
 * @param {object} parent parent node
 * @return {object} section
 */
function addSectionHeading(title, src, parent) {
  const para = $('<p>', {
    class: 'w3-xlarge my-highlight',
    html: title,
  }).appendTo(parent);

  createIcon(src, para, '', 32, 'ios-glyphs');

  return para;
}

/**
 * formate date in specfic style
 * @param {Date} date Date object
 * @param {string} format date format
 * @return {string} formated date string
 */
function formatDate(date, format) {
  let result = format;
  result = result.replace(
      /\bmmm\b/,
      date.toLocaleString('default', {month: 'long'}));
  result = result.replace(/\by\b/, date.getFullYear());
  result = result.replace(/\bm\b/, date.getMonth() + 1);
  result = result.replace(/\bd\b/, date.getDate());
  return result;
}

/**
 * show CV template
 */
function showCVTemplate() {
  /**
   * add period for section
   * @param {Date} start start date
   * @param {Date} end end date
   * @param {object} parent parent node
   */
  function addPeriod(start, end, parent) {
    const para = $('<p>', {
      html: `${formatDate(start, 'y-m')} - ${formatDate(end, 'y-m')}`,
    }).appendTo(parent);

    createIcon('calendar', para, '', 24);
  }

  const container = $('<div>', {
    class: mobileFlag ? '' : 'my-flex-container',
  }).appendTo(main);

  // #region left column
  const leftColumn = $('<div>', {
    id: 'left-column',
  }).appendTo(container);

  // #region avatar
  const displayContainer = $('<div>', {
    class: 'w3-display-container',
  }).appendTo(leftColumn);

  $('<img>', {
    src: `${dir}/avatar.jpg`,
  }).appendTo(displayContainer);

  // #endregion avatar

  // #region info

  const info = $('<div>', {
    id: 'info',
    class: 'my-padding',
  }).appendTo(leftColumn);

  addSectionHeading('Info', 'contract-job', info);

  ['name', 'address', 'email', 'phone'].forEach((info) => {
    info = {
      link: info,
      text: info.match('name') ? person.fullName : person[info],
    };
    createIconText(info, $('#info'));
  });

  // #endregion info

  $('<hr>').appendTo(leftColumn);

  // #region skills
  const skills = $('<div>', {
    class: 'my-padding my-margin',
    id: 'skills',
  }).appendTo(leftColumn);

  addSectionHeading('Skills', 'creativity', skills);

  person.skills.forEach((skill, i) => {
    createIconText({
      link: skill.match(/En/) ? 'language' : skill,
      text: skill,
    }, skills);
    // skill level
    const percent = `${(5 - i) * 10}%`;
    $('<div>', {
      class: `w3-center w3-round-xlarge w3-text-white ${color}`,
      html: percent,
    }).appendTo($('<div>', {
      class: 'w3-light-gray w3-round-xlarge w3-small',
    }).appendTo(skills)).width(percent);
  });
  // #endregion skills

  // #endregion left column

  // #region right column
  const rightColumn = $('<div>', {
    class: 'my-padding',
    id: 'right-column',
  }).appendTo(container);

  // #region experience
  const workExperience = $('<div>', {
    class: 'my-padding',
    id: 'experience',
  }).appendTo(rightColumn);

  addSectionHeading('Work Experience', 'briefcase', workExperience);

  person.experience.forEach((experience) => {
    const start = experience.period.start;
    const end = experience.period.end;
    const div = $('<div>').appendTo(workExperience);
    $('<p>', {
      html: `<b>${experience.job}</b>, ${experience.company}`,
    }).appendTo(div);

    addPeriod(start, end, div);

    $('<p>', {
      html: experience.description,
    }).appendTo(div);
  });
  // #endregion

  $('<hr>').appendTo(rightColumn);

  // #region education

  const educationBackground = $('<div>', {
    class: 'my-padding',
    id: 'education',
  }).appendTo(rightColumn);

  addSectionHeading('Education', 'education', educationBackground);

  person.education.forEach((education) => {
    const start = education.period.start;
    const end = education.period.end;
    const div = $('<div>').appendTo(educationBackground);
    $('<p>', {
      html: `${education.school}, <b>${education.major}</b>, \
      <b>${education.degree}</b> degree`,
    }).appendTo(div);

    addPeriod(start, end, div);

    $('<p>', {
      html: education.description,
    }).appendTo(div);
  });
  // #endregion education

  // #endregion right column

  container.children().each(function(i) {
    $(this).addClass('my-card my-margin').css({flex: `${i + 1}`});
  });
}

/**
 * create icon based on icons8 link
 * @param {string} icon icon name
 * @param {object} parent parent node
 */
function createIconText(icon, parent) {
  const node = $(`<p>`).appendTo(parent);

  createIcon(icon.link, node);

  $('<span>', {
    html: `${icon.text ? icon.text : icon.link}`,
  }).appendTo(node);
}

/**
 * show Homepage
 */
function showHomepage() {
  document.title = 'Homepage';


  // #region my info

  // education
  const undergraduate = new Education(
      'Shanghai University',
      '11121369',
      'Bachelor Degree of Engineering',
      'Computer Science and Techonology',
      new Period(new Date('2011-09'), new Date('2015-07')),
      `<ul><li>When I was a freshman, I joined the Blue Bond Volunteer \
      Society to help elementary school students to study mathematics.</li>
      <li>In the third year, I teamed up with students from the Department \
      of Mathematics and Communication Engineering to participate in the \
      International Mathematical Modeling Competition, responsible for \
      building models using MATLAB.</li><li>Before I graduated, collaborated\
       with fellow students to complete the deep network character \
       recognition algorithm and then improved the algorithm for the actual \
       scene as a personal graduation design project.</li></ul>`,
  );
  const graduate = new Education(
      'Standford University',
      '11121369',
      'Master',
      'Artificial Intelligence',
      new Period(new Date('2011-09'), new Date('2015-06')),
      'Lorem ipsum dolor sit amet. Praesentium magnam consectetur vel in.',
  );
  let education = [undergraduate, graduate];

  const skills = [
    'JavaScript',
    'PowerShell',
    'Office 365',
    'English',
  ];

  const experience = [
    new Experience(
        'Front End Developer',
        'W3School.com',
        new Period(new Date('2018-01'), new Date('2019-12')),
        'Consectetur adipisicing elit. Praesentium magnam consectetur vel i.',
    ),
    new Experience(
        'Web Developer',
        'Something.com',
        new Period(new Date('2015-12'), new Date('2017-12')),
        'Lorem ipsum dolor sit amet. Praesentium magnam consectetur vel in.',
    ),
  ];

  person = new Person(
      new Name('Zhang', 'Yao'),
      new Date('1992-09-29'),
      'Male',
      'San Francisco, US',
      'example@mail.com',
      '1800800800',
      education,
      experience,
      skills,
  );
  // #endregion my info

  showCVTemplate();

  // #region cert

  /**
   * show certification
   */
  function showCert() {
    const cert = $(this).html();
    const modal = createModal(cert);
    const div = $('<div>', {class: 'my-padding'}).appendTo(modal);

    $('<p>', {
      class: 'w3-center w3-xlarge my-highlight',
      html: education.school.toUpperCase(),
    }).appendTo(div);

    $('<hr>').appendTo(div);

    $('<p>', {
      class: 'w3-center w3-large my-highlight',
      html: `${education.school.toUpperCase()} \
      CERTIFICATE OF ${cert.toUpperCase()}`.replace(/ +/g, ' '),
    }).appendTo(div);

    $('<p>', {
      html: `${person.fullName}, ${person.sex}, born on \
      ${formatDate(person.birthday, 'mmm d, y')}, was an undergraduate \
      student majoring in ${education.major} of ${education.school} from \
       ${formatDate(education.period.start, 'mmm y')} to \
       ${formatDate(education.period.end, 'mmm y')}. He has completed all \
       the prescribed ${education.length}-year undergraduate courses, passed \
       all the examinations and is entitled to be a graduate of this \
       university.${cert.match(/Degree/) ? ` By the authority of "the \
       Regulations of the People's Republic of China Regarding Academic \
       Degrees", he has been awarded the ${education.degree}.
       No.1028042015001796(${education.id})` : '<br>No.102801201505002004'}`,
    }).appendTo(div);

    $('<p>', {
      class: '',
      html: `Archives of ${education.school}
      ${formatDate(education.period.end, 'y-m-d')}`,
    }).appendTo(div);

    $('<hr>').appendTo(div);

    const para = $('<p>', {
      html: `Archives of ${education.school}`,
    }).appendTo(div);

    Object.entries(admin).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];
      para.html(`${para.html()}, ${toCase(key)}: ${value}`);
    });
  }

  education = person.education[0];
  const para = $('<p>').appendTo($('#education').children().eq(1));
  const admin = {
    add: 'No.99 Shangda Road, Shanghai PRC 200444',
    tel: '021-66133408',
    handler: 'Ji Huimei',
    administrator: 'Zhang Yanrong',
  };

  ['Degree', 'Diploma'].forEach((cert) => {
    $('<button>', {
      html: cert,
    }).appendTo(para).click(showCert);
  });

  // #endregion cert

  // #region transcript
  $('<button>', {
    html: 'Transcript',
  }).appendTo(para).click(showTranscript);

  /**
   * show transcript table
   */
  function showTranscript() {
    const modal = createModal('Transcript');
    const div = $('<div>', {class: 'my-padding'}).appendTo(modal);

    let para = $('<p>', {html: `Name: ${person.fullName}`}).appendTo(div);

    Object.entries(education).forEach((entry) => {
      const key = entry[0];
      let value = key.match(/name/) ? person.fullName : entry[1];
      value = Number.isInteger(value) ? `${value} Year` : value;
      if (key.match(/id|major|length/)) {
        para.html(`${para.html()}<br>${toCase(key)}: ${value}`);
      }
    });

    addScripts('transcripts', () => {
      let gps = 0;
      transcripts.forEach((course) => {
        const score = course.score;
        let gp = 0; // grade point

        /**
         * The grading system is as follows:A:90-100(4.0),A-:85-89.9(3.7),
         * B+:82-84.9(3.3),B:78-81.9(3.0),B-:75-77.9(2.7),C+:72-74.9(2.3),
         * C:68-71.9(2.0),C-:66-67.9(1.7),D:64-65.9(1.5),D-:60-63.9(1.0),
         * F:0-59.9(0).<br>
         * Excellent:90-100(4.0),Good:80-89(3.0),Medium:70-79(2.0),
         * Qualified:60-69(1.5),Fail:0-59.9(0).Missing,Absent:(0),
         * P:pass(no grade point),L:fail(no grade point).
         */
        if (score.match(/A|Excellent/) || (+score > 90)) {
          gp = 4.0;
        } else if (score.match(/A-/) || (+score > 85)) {
          gp = 3.7;
        } else if (score.match(/B+/) || (+score > 82)) {
          gp = 3.3;
        } else if (score.match(/B|Good/) || (+score > 78)) {
          gp = 3.0;
        } else if (score.match(/B-/) || (+score > 75)) {
          gp = 2.7;
        } else if (score.match(/C+/) || (+score > 72)) {
          gp = 2.3;
        } else if (score.match(/C|Medium/) || (+score > 68)) {
          gp = 2.0;
        } else if (score.match(/C-/) || (+score > 66)) {
          gp = 1.7;
        } else if (score.match(/D|Qualified/) || (+score > 64)) {
          gp = 1.5;
        } else if (score.match(/D-/) || (+score > 60)) {
          gp = 1.0;
        } else if (score.match(/F|Fail|Missing|Absent/) || (+score > 0)) {
          gp = 0;
        } else {
          gp = '';
        }
        course['grade point'] = gp;
        gps += gp * +course.credit;
      });

      const table = toTable(transcripts, div).insertAfter($('p', div).eq(0));
      $('<caption>', {
        html: `${education.school.toUpperCase()} \
        TRANSCRIPT OF ACADEMIC RECORD`.replace(/ +/g, ' '),
      }).prependTo(table);

      const tr = $('<tr>').appendTo($('<tfoot>').appendTo(table));
      const credits = execSheetFunc(table, 'Credit', 'sum');
      ['', 'Total Credit', credits,
        '', 'GPA', (gps / credits).toFixed(2)].forEach((td) => {
        $('<td>', {html: td}).appendTo(tr);
      });
    });

    $('<p>', {html: `One credit unit equals ten class hours, for experiment 
    and practice that equals twenty class hours.`}).appendTo(div);

    para = $('<p>', {
      html: `Archives of ${education.school}`,
    }).appendTo(div);

    Object.entries(admin).forEach((entry) => {
      const key = entry[0];
      const value = entry[1];
      para.html(`${para.html()}, ${key}: ${value}`);
    });
  }

  // #endregion transcript

  // #region sites

  $('#sites').appendTo($('body'));
  const rightColumn = $('#right-column');
  $('<hr>').appendTo(rightColumn);

  addSectionHeading('Sites', 'web', $('#sites')).prependTo($('#sites'));

  $('#sites').appendTo(rightColumn);
  // #endregion sites

  const icons = ['notepad', 'firefox', 'test', 'test'];
  $('dt').each(function(i) {
    createIcon(icons[i], $(this), '', 20);
  }).click(function() {
    $(`button:contains('${$(this).text()}')`).click();
  }).addClass('my-click');
}

/**
 * execute function on specific column
 * @param {object} table table node
 * @param {string} header column header
 * @param {string} type function type
 * @return {object} result
 */
function execSheetFunc(table, header, type) {
  table = fromTable(table);
  let sum = 0;
  let result = 0;

  /**
   * sum up specific table column
   * @return {number} sum
   */
  function sumup() {
    table.forEach((row) => {
      sum += +row[header];
    });
    return sum;
  }
  if (type.match(/average/)) {
    result = sumup() / Object.keys(table).length;
  } else if (type.match(/sum/)) {
    result = sumup();
  }
  return result;
}

let person = {};
if (homeFlag && !link) showHomepage();
