// Miles For Champions: event settings.
// Edit the values below to update the registration page. Anything left as "" shows as "To be announced".
window.MFC_CONFIG = {
  // Google Apps Script web app URL that saves registrations to the "Miles For Champions" sheet.
  // Registration can't be submitted until this is set (see README → Registration setup).
  scriptUrl: "",

  // Used to decide whether a runner is under 18 on race day (YYYY-MM-DD).
  raceDay: "2027-02-27",

  event: {
    date: "Saturday, Feb. 27 – Sunday, Feb. 28, 2027",
    startTime: "1:00 PM Saturday · finishes 1:00 PM Sunday",
    location: "Private property about 3 miles east of Lake Arcadia, Oklahoma City",
    registrationDeadline: "",
  },

  // Event rules. Leave "" until the race director confirms each one.
  rules: {
    loopStarts: "Every hour, on the hour",
    loopTimeLimit: "",
    relayExchange: "",
    soloRequirements: "",
    aidStations: "",
    startEnd: "Starts Feb. 27 at 1:00 PM · Ends Feb. 28 at 1:00 PM",
    safety: "",
  },

  // Official participant waiver, approved by the event organizer. Paste the full text, or a link to it.
  waiver: {
    text: "",
    url: "",
  },

  links: {
    donate: "https://www.givengain.com/project/ryan-raising-funds-for-special-olympics-massachusetts-128642",
    learnMore: "index.html",
    site: "https://milesforchampions.com/",
  },
};
