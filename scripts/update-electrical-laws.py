"""Refresh official e-Gov snapshots; only currently enforced revisions are accepted."""
import json, urllib.request, base64, datetime, concurrent.futures, xml.etree.ElementTree as ET
from pathlib import Path
CATALOG=[('339AC0000000170','電気事業法'),('335AC0000000139','電気工事士法'),('336AC0000000234','電気用品安全法'),('345AC1000000096','電気工事業法'),('409M50000400052','電気設備技術基準')]
def read(entry):
    id,label=entry
    url=f'https://laws.e-gov.go.jp/api/2/law_data/{id}?law_full_text_format=xml'
    req=urllib.request.Request(url,headers={'Origin':'https://iwamotoco-source.github.io'})
    with urllib.request.urlopen(req,timeout=40) as r: x=json.load(r)
    assert x['law_info']['law_id']==id
    assert x['revision_info']['current_revision_status']=='CurrentEnforced'
    xml=ET.fromstring(base64.b64decode(x['law_full_text']))
    articles=[]
    for a in xml.findall('.//MainProvision//Article'):
        text='\n'.join(''.join(p.itertext()).strip() for p in a.findall('./Paragraph'))
        articles.append({'id':a.get('Num'),'number':a.findtext('ArticleTitle') or '', 'caption':a.findtext('ArticleCaption') or '', 'text':text})
    assert articles
    return {'id':id,'label':label,'title':x['revision_info']['law_title'],'revision':x['revision_info']['law_revision_id'],'enforced':x['revision_info']['amendment_enforcement_date'],'fetched':datetime.datetime.now(datetime.timezone.utc).isoformat(),'url':f'https://laws.e-gov.go.jp/law/{id}','articles':articles}
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool: laws=list(pool.map(read,CATALOG))
    out=Path(__file__).resolve().parents[1]/'data/electrical-laws.json'
    out.write_text(json.dumps({'laws':laws},ensure_ascii=False,separators=(',',':'))+'\n')
    print([(x['label'],len(x['articles'])) for x in laws])
