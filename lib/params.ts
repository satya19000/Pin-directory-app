export type QueryParams = Record<string,string|string[]|undefined>;
export function first(value:string|string[]|undefined,fallback=''){return (Array.isArray(value)?value[0]:value)??fallback;}
