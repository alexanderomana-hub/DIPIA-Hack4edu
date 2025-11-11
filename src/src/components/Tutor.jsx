import React, { useEffect, useState, useRef } from 'react';
import { BsArrowLeftCircle, BsBook, BsPlayCircle, BsListUl, BsSend, BsChatDotsFill } from 'react-icons/bs';
import { useTranslation } from '../hack4edu/hooks_useTranslation';
import './Tutor.css';

const stages = ['introduction','overview','objectives','prerequisites','materials','steps','conclusion','gallery','documents','cases','quiz','glossary','report'];

const isMp4 = (url) => /\.mp4($|\?)/i.test(url);
const isYouTube = (url) => /youtube\.com|youtu\.be/i.test(url);
const isVimeo = (url) => /vimeo\.com/i.test(url);
const toYouTubeEmbed = (url) => {
  try {
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    const u = new URL(url);
    const id = u.searchParams.get('v');
    return id ? `https://www.youtube.com/embed/${id}` : url;
  } catch { return url; }
};
const toVimeoEmbed = (url) => {
  try {
    const parts = url.split('/');
    const id = parts[parts.length - 1];
    return `https://player.vimeo.com/video/${id}`;
  } catch { return url; }
};

const Tutor = ({ onBack }) => {
  const [knowledge, setKnowledge] = useState(null);
  const [activeKey, setActiveKey] = useState('humedad_interior');
  const { t } = useTranslation();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [activeStage, setActiveStage] = useState('overview');
  const [lightbox, setLightbox] = useState({ open: false, url: '' });
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [report, setReport] = useState({ summary: '', diagnosis: '', evidence: '', actions: '' });
  const bottomRef = useRef(null);

  useEffect(() => {
    fetch('/knowledge/damage_knowledge.json')
      .then(r => r.json())
      .then(setKnowledge)
      .catch(() => setKnowledge({}));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const item = knowledge ? knowledge[activeKey] : null;

  useEffect(() => {
    setQuizIndex(0);
    setQuizScore(Number(localStorage.getItem(`quiz_score_${activeKey}`) || 0));
    setQuizFinished(false);
    setSelectedOption(null);
    setQuizOpen(false);
    setGlossaryQuery('');
    setReport({ summary: '', diagnosis: '', evidence: '', actions: '' });
  }, [activeKey]);

  const handleSend = async (e) => {
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    const nextMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setSending(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `${t('tutor.chat.response', 'Tutor\'s Response')}: ${t('common.loading', 'Loading...')} (modelo en entrenamiento)` }
      ]);
      setSending(false);
    }, 700);
  };

  const commonBox = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: 16 };

  const renderVideos = () => {
    const videos = item?.videos || [];
    if (!videos.length) return null;
    return (
      <div style={{ marginTop: 16 }}>
        <h4 style={{ color: '#FFD700', display: 'flex', alignItems: 'center', gap: 8 }}><BsPlayCircle /> {t('knowledge.videos', 'Videos')}</h4>
        <div style={{ display: 'grid', gap: 12 }}>
          {videos.map((v, i) => {
            if (isMp4(v)) {
              return (
                <video key={i} controls style={{ width: '100%', borderRadius: 8, background: '#000' }}>
                  <source src={v} type="video/mp4" />
                </video>
              );
            }
            if (isYouTube(v)) {
              const src = toYouTubeEmbed(v);
              return (
                <div key={i} style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe src={src} title={`yt-${i}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              );
            }
            if (isVimeo(v)) {
              const src = toVimeoEmbed(v);
              return (
                <div key={i} style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe src={src} title={`vimeo-${i}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen></iframe>
                </div>
              );
            }
            return (
              <a key={i} href={v} target="_blank" rel="noreferrer" style={{ color: '#4FC3F7' }}>{v}</a>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGallery = () => {
    const images = item?.images || [];
    if (!images.length) {
      return (
        <div style={commonBox}>
          <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.stage.gallery','Gallery')}</h3>
          <p style={{ color:'#ccc' }}>{t('tutor.classroom.section.gallery.empty_title','No images in the gallery')}</p>
          <p style={{ color:'#888' }}>{t('tutor.classroom.section.gallery.empty_desc','Add your first image to show in the gallery.')}</p>
        </div>
      );
    }
    return (
      <div>
        <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.stage.gallery','Gallery')}</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(140px,1fr))', gap:12 }}>
          {images.map((url, idx) => (
            <button key={idx} onClick={() => setLightbox({ open:true, url })} style={{ border:'none', padding:0, background:'transparent', cursor:'pointer' }}>
              <img src={url} alt={`gallery-${idx}`} onError={(e)=>{ if(e.currentTarget.src.indexOf('placeholder.svg')===-1){ e.currentTarget.src = '/knowledge/images/placeholder.svg'; } }} style={{ width:'100%', height:120, objectFit:'cover', borderRadius:10, border:'1px solid rgba(255,255,255,0.12)' }} />
            </button>
          ))}
        </div>
        {lightbox.open && (
          <div onClick={() => setLightbox({ open:false, url:'' })} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
            <img src={lightbox.url} alt="full" onError={(e)=>{ e.currentTarget.src = '/knowledge/images/placeholder.svg'; }} style={{ maxWidth:'90vw', maxHeight:'85vh', borderRadius:8, border:'1px solid rgba(255,255,255,0.2)' }} />
          </div>
        )}
      </div>
    );
  };

  const renderDocuments = () => {
    const docs = item?.documents || [];
    if (!docs.length) {
      return (
        <div style={commonBox}>
          <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.stage.documents','Documents')}</h3>
          <p style={{ color:'#ccc' }}>{t('tutor.classroom.section.documents.empty_title','No documents in the section')}</p>
          <p style={{ color:'#888' }}>{t('tutor.classroom.section.documents.empty_desc','Add your first document to show in the section.')}</p>
        </div>
      );
    }
    return (
      <div style={commonBox}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.stage.documents','Documents')}</h3>
          <button onClick={() => window.print()} className="save-button">{t('pdf.generate','Generate PDF')}</button>
        </div>
        <ul>
          {docs.map((d, i) => (
            <li key={i} style={{ marginBottom:8 }}>
              <a href={(d.url||d)} target="_blank" rel="noreferrer" style={{ color:'#4FC3F7' }}>{d.title || d.url || d}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderCases = () => {
    const cases = item?.cases || [];
    if (!cases.length) {
      return (
        <div style={commonBox}>
          <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.stage.cases','Cases')}</h3>
          <p style={{ color:'#ccc' }}>No cases yet</p>
        </div>
      );
    }
    return (
      <div style={{ display:'grid', gap:16 }}>
        {cases.map((c, i) => (
          <div key={i} style={commonBox}>
            <h4 style={{ marginTop:0 }}>{c.title || `Case ${i+1}`}</h4>
            {c.image && <img src={c.image} alt={c.title || `case-${i+1}`} onError={(e)=>{ e.currentTarget.src = '/knowledge/images/placeholder.svg'; }} style={{ width:'100%', maxHeight:220, objectFit:'cover', borderRadius:10, marginBottom:8 }} />}
            <p style={{ color:'#ddd' }}>{c.description || ''}</p>
            {c.link && <a href={c.link} target="_blank" rel="noreferrer" style={{ color:'#4FC3F7' }}>Ver más</a>}
          </div>
        ))}
      </div>
    );
  };

  const renderQuiz = () => {
    const questions = item?.quiz?.questions || [];
    return (
      <div style={commonBox}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ marginTop:0 }}>{t('quiz.title','Quiz')}</h3>
          <button className="tutor-button tutor-button--primary" onClick={()=>setQuizOpen(true)}>{t('quiz.start','Start Quiz')}</button>
        </div>
        {typeof quizScore === 'number' && questions.length > 0 && (
          <p style={{ color:'#ccc' }}>{t('quiz.score','Score')}: {quizScore}/{questions.length} ({questions.length ? Math.round((quizScore/questions.length)*100) : 0}%)</p>
        )}
        {quizOpen && (
          <div className="tutor-modal-backdrop" onClick={()=>setQuizOpen(false)}>
            <div className="tutor-modal" onClick={(e)=>e.stopPropagation()}>
              <div className="tutor-modal__header">
                <strong>{t('quiz.title','Quiz')}</strong>
                <button className="tutor-button tutor-button--ghost" onClick={()=>setQuizOpen(false)}>{t('common.close','Close')}</button>
              </div>
              <div className="tutor-modal__body">
                {questions.length === 0 ? (
                  <p style={{ color:'#ccc' }}>{t('quiz.no_questions','No questions available')}</p>
                ) : !quizFinished ? (
                  <>
                    <div style={{ color:'#ccc', marginBottom:8 }}>{t('quiz.question','Question')} {quizIndex+1}/{questions.length}</div>
                    <p style={{ color:'#fff' }}>{questions[quizIndex].q}</p>
                    <div style={{ display:'grid', gap:8 }}>
                      {questions[quizIndex].options.map((opt, idx) => (
                        <label key={idx} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
                          <input type="radio" name="opt_modal" checked={selectedOption===idx} onChange={()=>setSelectedOption(idx)} />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ color:'#fff' }}><strong>{t('quiz.score','Score')}:</strong> {quizScore}/{questions.length} ({Math.round((quizScore/questions.length)*100)}%)</p>
                  </>
                )}
              </div>
              <div className="tutor-modal__footer">
                {!quizFinished ? (
                  <button className="tutor-button tutor-button--primary" onClick={() => {
                    if (selectedOption === null || selectedOption === undefined) return;
                    const q = questions[quizIndex];
                    const correct = Number(selectedOption) === Number(q.correctIndex);
                    const newScore = quizScore + (correct ? 1 : 0);
                    setQuizScore(newScore);
                    if (quizIndex + 1 < questions.length) {
                      setQuizIndex(quizIndex + 1);
                      setSelectedOption(null);
                    } else {
                      setQuizFinished(true);
                      localStorage.setItem(`quiz_score_${activeKey}`, String(newScore));
                    }
                  }}>{quizIndex+1 < questions.length ? t('quiz.next','Next') : t('quiz.finish','Finish Quiz')}</button>
                ) : (
                  <button className="tutor-button tutor-button--primary" onClick={()=>setQuizOpen(false)}>{t('common.close','Close')}</button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGlossary = () => {
    const glossary = item?.glossary || {};
    const terms = Object.keys(glossary).sort();
    const filtered = glossaryQuery ? terms.filter(tk => tk.toLowerCase().includes(glossaryQuery.toLowerCase())) : terms;
    return (
      <div style={commonBox}>
        <h3 style={{ marginTop:0 }}>{t('glossary.title','Glossary')}</h3>
        <input value={glossaryQuery} onChange={(e)=>setGlossaryQuery(e.target.value)} placeholder={t('glossary.term','Term')} className="form-input" style={{ marginBottom: 10 }} />
        {filtered.length === 0 ? (
          <p style={{ color:'#ccc' }}>{t('glossary.empty_title','No terms in the glossary')}</p>
        ) : (
          <div style={{ display:'grid', gap:8 }}>
            {filtered.map((term) => (
              <div key={term} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, padding:10 }}>
                <strong style={{ color:'#FFD700' }}>{term}</strong>
                <div style={{ color:'#ddd' }}>{glossary[term]}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderReport = () => {
    return (
      <div style={commonBox}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ marginTop:0 }}>Informe técnico</h3>
          <button className="tutor-button tutor-button--primary" onClick={()=>window.print()}>{t('pdf.generate','Generate PDF')}</button>
        </div>
        <div className="tutor-grid">
          <div>
            <label style={{ color:'#ccc' }}>Resumen</label>
            <textarea className="form-input" style={{ width:'100%', minHeight:80 }} value={report.summary} onChange={(e)=>setReport({ ...report, summary: e.target.value })} />
          </div>
          <div>
            <label style={{ color:'#ccc' }}>Diagnóstico</label>
            <textarea className="form-input" style={{ width:'100%', minHeight:80 }} value={report.diagnosis} onChange={(e)=>setReport({ ...report, diagnosis: e.target.value })} />
          </div>
          <div>
            <label style={{ color:'#ccc' }}>Evidencia</label>
            <textarea className="form-input" style={{ width:'100%', minHeight:80 }} value={report.evidence} onChange={(e)=>setReport({ ...report, evidence: e.target.value })} />
          </div>
          <div>
            <label style={{ color:'#ccc' }}>Acciones</label>
            <textarea className="form-input" style={{ width:'100%', minHeight:80 }} value={report.actions} onChange={(e)=>setReport({ ...report, actions: e.target.value })} />
          </div>
        </div>
      </div>
    );
  };

  const renderStage = () => {
    if (!item) return null;
    switch (activeStage) {
      case 'introduction':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={commonBox}>
              <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.section.introduction', 'Introduction')}</h3>
              <p style={{ color: '#ddd' }}>{item.definition}</p>
            </div>
          </div>
        );
      case 'overview':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={commonBox}>
              <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.section.overview', 'Overview')}</h3>
              <div className="results-summary" style={{ marginBottom: 10 }}>
                <div className="summary-item"><span className="summary-label">{t('knowledge.severity', 'Severity')}</span><span className="summary-value">{item.severity}</span></div>
                <div className="summary-item"><span className="summary-label">{t('knowledge.priority', 'Priority')}</span><span className="summary-value">{item.priority}</span></div>
              </div>
              <p style={{ color: '#ddd' }}>{item.title}</p>
              {renderVideos()}
            </div>
          </div>
        );
      case 'objectives':
        return (
          <div style={commonBox}>
            <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.section.objectives', 'Objectives')}</h3>
            <ul>
              {item.investigation_steps?.slice(0,3).map((s,i)=>(<li key={i} style={{ color:'#fff', opacity:0.85 }}>{s}</li>))}
            </ul>
          </div>
        );
      case 'prerequisites':
        return (
          <div style={commonBox}>
            <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.section.prerequisites', 'Prerequisites')}</h3>
            <ul>
              {item.technical_terms?.map((tterm,i)=>(<li key={i} style={{ color:'#fff', opacity:0.85 }}>{tterm}</li>))}
            </ul>
          </div>
        );
      case 'materials':
        return (
          <div style={commonBox}>
            <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.section.materials', 'Materials Needed')}</h3>
            <ul>
              {item.solutions?.slice(0,3).map((m,i)=>(<li key={i} style={{ color:'#fff', opacity:0.85 }}>{m}</li>))}
            </ul>
          </div>
        );
      case 'steps':
        return (
          <div style={{ display: 'grid', gap: 16 }}>
            <div style={commonBox}>
              <h4 style={{ color: '#FFD700' }}>{t('knowledge.investigation_steps', 'Investigation Steps')}</h4>
              <ol>
                {item.investigation_steps?.map((s,i)=>(<li key={i} style={{ color:'#fff', opacity:0.85 }}>{s}</li>))}
              </ol>
            </div>
            <div style={commonBox}>
              <h4 style={{ color: '#FFD700' }}>{t('knowledge.causes', 'Causes')}</h4>
              <ul>
                {item.causes?.map((c,i)=>(<li key={i} style={{ color:'#fff', opacity:0.85 }}>{c}</li>))}
              </ul>
            </div>
          </div>
        );
      case 'conclusion':
        return (
          <div style={commonBox}>
            <h3 style={{ marginTop: 0 }}>{t('tutor.classroom.section.conclusion', 'Conclusion')}</h3>
            <p style={{ color:'#ddd' }}>{t('knowledge.action_required','Action Required')}: {item.priority}</p>
          </div>
        );
      case 'gallery':
        return renderGallery();
      case 'documents':
        return renderDocuments();
      case 'cases':
        return renderCases();
      case 'quiz':
        return renderQuiz();
      case 'glossary':
        return renderGlossary();
      case 'report':
        return renderReport();
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-content" style={{ padding: 20 }}>
      <div className="analysis-header" style={{ marginBottom: 20 }}>
        <button className="back-button" onClick={onBack}>
          <BsArrowLeftCircle className="icon" /> {t('common.back', 'Back')}
        </button>
        <h2><BsBook className="icon" /> {t('knowledge.title', 'Virtual Classroom')}</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        <div className="upload-card" style={{ padding: 0 }}>
          <div style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BsListUl /> {t('knowledge.topics', 'Topics')}
          </div>
          <div style={{ maxHeight: '65vh', overflow: 'auto' }}>
            {knowledge && Object.entries(knowledge).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveKey(key)}
                style={{
                  width: '100%', textAlign: 'left', padding: '12px 16px',
                  background: activeKey === key ? 'rgba(255,255,255,0.08)' : 'transparent',
                  border: 'none', color: '#fff', cursor: 'pointer'
                }}
              >
                {value.title}
              </button>
            ))}
          </div>
        </div>

        <div className="results-card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.12)', padding: 12 }}>
            {stages.map((s) => (
              <button key={s}
                onClick={() => setActiveStage(s)}
                style={{
                  background: activeStage === s ? 'rgba(255,255,255,0.12)' : 'transparent',
                  color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 10, padding: '6px 10px', cursor: 'pointer'
                }}
              >
                {t(`tutor.classroom.stage.${s}`, s)}
              </button>
            ))}
          </div>
          <div style={{ padding: 16 }}>
            {item ? renderStage() : <p style={{ color:'#ccc' }}>{t('common.loading','Loading...')}</p>}
          </div>
        </div>

      </div>
      <button className="tutor-fab" onClick={()=>setChatOpen(true)}>
        <BsChatDotsFill /> Chat
      </button>
      {chatOpen && (
        <div className="tutor-modal-backdrop" onClick={()=>setChatOpen(false)}>
          <div className="tutor-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="tutor-modal__header">
              <strong>{t('tutor.chat.title', 'Chat with the Tutor')}</strong>
              <button className="tutor-button tutor-button--ghost" onClick={()=>setChatOpen(false)}>{t('common.close','Close')}</button>
            </div>
            <div className="tutor-modal__body" style={{ maxHeight: '60vh', overflow: 'auto' }}>
              {messages.length === 0 && (
                <p style={{ color:'#aaa' }}>{t('tutor.chat.subtitle', 'Ask your questions about the diagnosis')}</p>
              )}
              {messages.map((m, i) => (
                <div key={i} style={{
                  background: m.role === 'user' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(52, 152, 219, 0.15)',
                  border: m.role === 'user' ? '1px solid rgba(46, 204, 113, 0.4)' : '1px solid rgba(52, 152, 219, 0.4)',
                  borderRadius: 12, padding: '8px 12px', marginBottom: 8
                }}>
                  <strong style={{ color: '#FFD700' }}>{m.role === 'user' ? 'You' : 'Tutor'}</strong>
                  <div style={{ color: '#fff' }}>{m.content}</div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="tutor-modal__footer">
              <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, width: '100%' }}>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  placeholder={t('tutor.chat.placeholder', 'Write your question here...')}
                  className="form-input" style={{ flex: 1 }}
                />
                <button type="submit" className="tutor-button tutor-button--primary" disabled={sending}>
                  <BsSend /> {t('tutor.chat.send','Send')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutor;


