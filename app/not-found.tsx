import Link from 'next/link';
import { Search } from '@/components/search';
export default function NotFound(){return <div className="container page-content"><div className="empty-state"><span className="section-kicker">ADDRESS NOT FOUND</span><h1>We couldn’t find that page.</h1><p>The PIN or office may not be in this dataset. Check the address or try a new search.</p><div className="narrow-search"><Search compact/></div><Link href="/" className="text-link">Back to the directory</Link></div></div>;}
