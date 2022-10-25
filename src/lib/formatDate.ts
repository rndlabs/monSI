export const specificLocalTime = (when: number): string =>
	new Date(when).toLocaleTimeString('en-GB') // en-GB gets a 24hour format, but amazingly local time!

export const currentLocalTime = (): string => specificLocalTime(Date.now())
