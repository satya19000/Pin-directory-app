import { ImageResponse } from 'next/og';
export const alt='PIN Atlas – India PIN Code & Postal Directory';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){return new ImageResponse(<div style={{background:'#113d39',color:'#fff',width:'100%',height:'100%',display:'flex',flexDirection:'column',padding:'76px',justifyContent:'space-between'}}><div style={{fontSize:28,letterSpacing:7}}>PIN ATLAS / INDIA</div><div style={{display:'flex',flexDirection:'column',fontSize:82,fontWeight:700,lineHeight:1.1}}><span>Every place.</span><span style={{color:'#d2ee86'}}>One PIN code.</span></div><div style={{fontSize:27,color:'#d5e6e1'}}>Find postal codes. Browse states. Explore post offices.</div></div>,size);}
