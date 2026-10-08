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

  // Event rules shown under "How the Ultra Works": a short headline plus a description.
  rules: {
    startEnd: {
      headline: "February 27–28, 2027 | 1:00 PM to 1:00 PM",
      text: "The Miles for Champions Backyard Ultra begins Saturday, February 27, at 1:00 PM and concludes Sunday, February 28, at 1:00 PM. The event takes place on private property approximately 3 miles from Lake Arcadia in Oklahoma City, Oklahoma. The exact address and arrival instructions will be shared with registered participants before race day.",
    },
    loopStarts: {
      headline: "Every Hour, On the Hour",
      text: "The course consists of a 4.167-mile loop. The first loop begins at 1:00 PM on Saturday, with a new loop starting at the top of every hour for 24 hours. Runners must return to the starting area before the next loop begins. If you finish early, the remaining time is yours to rest, refuel, and prepare for the next loop.",
    },
    loopTimeLimit: {
      headline: "60 Minutes Per Loop",
      text: "Each 4.167-mile loop must be completed within 60 minutes. For example, if a loop begins at 1:00 PM, runners must finish before the next loop starts at 2:00 PM. There is no advantage to finishing faster other than having more time to recover. Runners participating in the 100-mile solo challenge must complete all 24 loops within their respective hourly windows.",
    },
    relayExchange: {
      headline: "One Team. 24 Loops. 100 Miles.",
      text: "Relay teams work together to complete 24 loops, approximately 100 miles. Teams can decide which runner completes each loop and how to divide the distance among teammates. One designated runner represents the team during each hourly loop. Exchanges take place at the start/finish area between loops. Teams may rotate runners however they choose, but each loop must be completed within the 60-minute time limit.",
    },
    soloRequirements: {
      headline: "24 Loops. 100 Miles. One Runner.",
      text: "Solo participants take on the full 100-mile challenge by completing all 24 loops themselves. Each loop begins on the hour and must be finished within 60 minutes. Runners may use the remaining time between loops to eat, hydrate, rest, change clothes, and prepare for the next start. The goal is to complete all 24 loops within the 24-hour event window.",
    },
    aidStations: {
      headline: "Support Along the Way",
      text: "A designated start/finish area will serve as the central gathering point for runners, relay teams, crews, and supporters. Participants should plan to bring their own hydration, nutrition, running gear, and any personal supplies needed for their distance. Additional information about available aid, water, restrooms, and crew setup will be provided before race day.",
    },
    safety: {
      headline: "Run Smart. Look Out for Each Other.",
      text: "Runner safety is a priority throughout the event. Participants are responsible for monitoring their physical condition, staying hydrated, and following all course instructions. Because the event continues overnight, runners participating after dark must carry a headlamp or other appropriate lighting and wear reflective or high-visibility gear. Runners should notify event staff if they withdraw or experience an issue on the course. Event organizers reserve the right to stop participation when necessary for safety.",
    },
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
