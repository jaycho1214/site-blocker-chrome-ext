export interface WarningTemplate {
  id: string
  name: string
  title: string
  message: string
  color: string
  icon: string
}

export const WARNING_TEMPLATES: Record<string, WarningTemplate> = {
  minimal: {
    id: "minimal",
    name: "Minimal",
    title: "Site Blocked",
    message: "This site is on your block list.",
    color: "red",
    icon: "⚠️"
  },
  motivational: {
    id: "motivational",
    name: "Motivational",
    title: "Stay Focused! 🎯",
    message:
      "You blocked this site to achieve your goals. Remember what you're working towards and stay on track!",
    color: "blue",
    icon: "🎯"
  },
  stern: {
    id: "stern",
    name: "Stern",
    title: "⚠️ Access Denied",
    message:
      "You've restricted access to this website. Continuing would break your commitment to yourself.",
    color: "red",
    icon: "⚠️"
  },
  humorous: {
    id: "humorous",
    name: "Humorous",
    title: "Oops! Wrong Turn 🙈",
    message:
      "Looks like you wandered into the forbidden zone! Your future self thanks you for this block.",
    color: "purple",
    icon: "🙈"
  },
  professional: {
    id: "professional",
    name: "Professional",
    title: "Productivity Notice",
    message:
      "Access to this website has been restricted to maintain focus and productivity during designated work hours.",
    color: "amber",
    icon: "📋"
  },
  mindful: {
    id: "mindful",
    name: "Mindful",
    title: "Pause & Reflect 🧘‍♀️",
    message:
      "Take a moment to breathe. What brought you here? Is this aligned with your intentions for today?",
    color: "green",
    icon: "🧘‍♀️"
  },
  gaming: {
    id: "gaming",
    name: "Gaming",
    title: "🎮 Quest Blocked!",
    message:
      "This site is locked until you complete your real-world quests. Check your task list and level up!",
    color: "purple",
    icon: "🎮"
  },
  timer: {
    id: "timer",
    name: "Time-focused",
    title: "⏰ Time Check",
    message:
      "You blocked this site to save time. Consider: what could you accomplish with these saved minutes?",
    color: "blue",
    icon: "⏰"
  },
  christian_holiness: {
    id: "christian_holiness",
    name: "Christian - Holiness",
    title: "✝️ Be Holy",
    message:
      '"Be holy, because I am holy." - 1 Peter 1:16. Let your browsing honor God and reflect His character in your life.',
    color: "purple",
    icon: "✝️"
  },
  christian_abstain: {
    id: "christian_abstain",
    name: "Christian - Abstain",
    title: "✝️ Abstain from Evil",
    message:
      '"Abstain from all appearance of evil." - 1 Thessalonians 5:22. Choose what is pure and pleasing to the Lord.',
    color: "purple",
    icon: "✝️"
  },
  christian_renewal: {
    id: "christian_renewal",
    name: "Christian - Renewal",
    title: "✝️ Renew Your Mind",
    message:
      '"Be transformed by the renewing of your mind." - Romans 12:2. Fill your thoughts with what is true, noble, and pure.',
    color: "blue",
    icon: "✝️"
  }
}

export const WARNING_TEMPLATES_ARRAY: WarningTemplate[] =
  Object.values(WARNING_TEMPLATES)
