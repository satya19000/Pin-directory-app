import type { MetadataRoute } from 'next';
import { absolute,canIndex } from '@/lib/seo';
export default function robots():MetadataRoute.Robots{return canIndex()?{rules:{userAgent:'*',allow:'/',disallow:['/api/','/search','/*?q=','/*&q=']},sitemap:absolute('/sitemap-index.xml')}:{rules:{userAgent:'*',disallow:'/'}};}
