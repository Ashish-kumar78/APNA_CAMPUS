import { useState } from 'react'
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  PenLine,
  Rss,
  Search,
  Send,
  Share2,
  Bookmark,
  ThumbsUp,
  User,
  X,
} from 'lucide-react'
import './BloggingPage.css'

const posts = [
  {
    id: 1,
    author: 'Rakesh Das',
    dept: 'CSE · Semester 5',
    initials: 'RN',
    date: '01 Oct 2026',
    tag: 'ACADEMIC',
    title: "How I'm preparing for my 5th Semester Internal Assessments",
    body: "With the internal assessment season approaching, I've been following a structured revision plan that has genuinely helped me stay on top of my coursework. I divide my subjects into daily 2-hour focus blocks and use the Pomodoro technique to keep distractions minimal. Here are a few strategies that worked for me...",
    likes: 34,
    comments: 8,
    bookmarked: false,
    liked: false,
    image: false,
  },
  {
    id: 2,
    author: 'Riya Patnaik',
    dept: 'CSE · Semester 5',
    initials: 'RP',
    date: '28 Sep 2026',
    tag: 'TECH',
    title: "My first Machine Learning project – a beginner's guide",
    body: "When I started learning Machine Learning, the sheer volume of concepts felt overwhelming. But breaking it down step by step made everything click. I built a sentiment analysis tool as my first project — here's what I learned and how you can replicate it using Python and scikit-learn. Let me walk you through the entire process from dataset collection to model evaluation...",
    likes: 52,
    comments: 15,
    bookmarked: true,
    liked: true,
    image: false,
  },
  {
    id: 3,
    author: 'Arjun Sahu',
    dept: 'Electronics · Semester 5',
    initials: 'AS',
    date: '22 Sep 2026',
    tag: 'CAMPUS LIFE',
    title: "Why Apna Campus culture makes the college experience truly memorable",
    body: "When people ask me what I love most about Apna Campus, it's not just the academics — it's the people, the festivals, the late-night study sessions in the library, and the sense of community. The college has a unique way of bringing students together through events, clubs, and the mentorship culture that faculty bring...",
    likes: 88,
    comments: 22,
    bookmarked: false,
    liked: false,
    image: false,
  },
]

const tags = ['All', 'ACADEMIC', 'TECH', 'CAMPUS LIFE', 'CAREER', 'SPORTS', 'CREATIVE']

export default function BloggingPage() {
  const [activeTag, setActiveTag] = useState('All')
  const [search, setSearch] = useState('')
  const [blogPosts, setBlogPosts] = useState(posts)
  const [composing, setComposing] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', body: '', tag: 'ACADEMIC' })
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentTexts, setCommentTexts] = useState({})
  const [postComments, setPostComments] = useState({})

  const filtered = blogPosts.filter((p) => {
    const q = search.toLowerCase()
    const matchTag = activeTag === 'All' || p.tag === activeTag
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)
    return matchTag && matchSearch
  })

  function toggleLike(id) {
    setBlogPosts((prev) =>
      prev.map((p) => p.id === id
        ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
        : p
      )
    )
  }

  function toggleBookmark(id) {
    setBlogPosts((prev) =>
      prev.map((p) => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)
    )
  }

  function publishPost() {
    if (!newPost.title.trim() || !newPost.body.trim()) return
    const post = {
      id: Date.now(),
      author: 'Rakesh Das',
      dept: 'CSE · Semester 5',
      initials: 'RN',
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      tag: newPost.tag,
      title: newPost.title,
      body: newPost.body,
      likes: 0,
      comments: 0,
      bookmarked: false,
      liked: false,
    }
    setBlogPosts((prev) => [post, ...prev])
    setNewPost({ title: '', body: '', tag: 'ACADEMIC' })
    setComposing(false)
  }

  function addComment(postId) {
    const text = commentTexts[postId]?.trim()
    if (!text) return
    setPostComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { author: 'Rakesh Das', text, date: 'Just now' }],
    }))
    setBlogPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: p.comments + 1 } : p))
    setCommentTexts((prev) => ({ ...prev, [postId]: '' }))
  }

  return (
    <div className="blogging-page">
      <div className="blogging-header">
        <div>
          <p className="blogging-kicker"><Rss size={13} />STUDENT BLOGGING</p>
          <h2>Campus Blog</h2>
          <p className="blogging-caption">Share experiences, ideas and knowledge with the Apna Campus community.</p>
        </div>
        <button className="compose-btn" onClick={() => setComposing(true)}>
          <PenLine size={14} />Write a Post
        </button>
      </div>

      {composing && (
        <div className="compose-panel">
          <div className="compose-panel-header">
            <h3><PenLine size={15} />New Blog Post</h3>
            <button type="button" onClick={() => setComposing(false)}><X size={16} /></button>
          </div>
          <div className="compose-fields">
            <div className="compose-tag-select">
              <label>Category</label>
              <div className="compose-tags">
                {tags.filter((t) => t !== 'All').map((tag) => (
                  <button
                    key={tag}
                    className={newPost.tag === tag ? 'active' : ''}
                    type="button"
                    onClick={() => setNewPost((p) => ({ ...p, tag }))}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <input
              className="compose-title-input"
              value={newPost.title}
              onChange={(e) => setNewPost((p) => ({ ...p, title: e.target.value }))}
              placeholder="Post title..."
            />
            <textarea
              className="compose-body-input"
              value={newPost.body}
              onChange={(e) => setNewPost((p) => ({ ...p, body: e.target.value }))}
              placeholder="Write your post here... Share your thoughts, experiences or knowledge with the community."
              rows={6}
            />
            <div className="compose-actions">
              <button className="compose-cancel" onClick={() => setComposing(false)}>Cancel</button>
              <button className="compose-publish" onClick={publishPost} disabled={!newPost.title.trim() || !newPost.body.trim()}>
                <Send size={13} />Publish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="blogging-controls">
        <label className="blog-search">
          <Search size={14} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search posts..." />
        </label>
        <div className="blog-tag-filters">
          {tags.map((tag) => (
            <button
              key={tag}
              className={activeTag === tag ? 'active' : ''}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="blog-posts-list">
        {filtered.map((post) => {
          const isExpanded = expandedPost === post.id
          const comments = postComments[post.id] || []
          return (
            <article key={post.id} className="blog-post-card">
              <div className="blog-post-header">
                <div className="blog-post-author">
                  <span className="blog-avatar">{post.initials}</span>
                  <div>
                    <strong>{post.author}</strong>
                    <small>{post.dept} · {post.date}</small>
                  </div>
                </div>
                <div className="blog-post-header-actions">
                  <span className="blog-tag">{post.tag}</span>
                  <button className="blog-more-btn" aria-label="More options"><MoreHorizontal size={16} /></button>
                </div>
              </div>

              <div className="blog-post-body">
                <h3>{post.title}</h3>
                <p className={isExpanded ? '' : 'truncated'}>{post.body}</p>
                {!isExpanded && post.body.length > 200 && (
                  <button className="blog-read-more" onClick={() => setExpandedPost(post.id)}>Read more</button>
                )}
                {isExpanded && (
                  <button className="blog-read-more" onClick={() => setExpandedPost(null)}>Show less</button>
                )}
              </div>

              <div className="blog-post-actions">
                <button
                  className={`blog-action-btn ${post.liked ? 'liked' : ''}`}
                  onClick={() => toggleLike(post.id)}
                >
                  <ThumbsUp size={14} />
                  {post.likes}
                </button>
                <button
                  className="blog-action-btn"
                  onClick={() => setExpandedPost(isExpanded ? null : post.id)}
                >
                  <MessageCircle size={14} />
                  {post.comments + comments.length}
                </button>
                <button className="blog-action-btn"><Share2 size={14} />Share</button>
                <button
                  className={`blog-action-btn bookmark ${post.bookmarked ? 'bookmarked' : ''}`}
                  onClick={() => toggleBookmark(post.id)}
                >
                  <Bookmark size={14} />
                </button>
              </div>

              {isExpanded && (
                <div className="blog-comments-section">
                  {comments.map((c, i) => (
                    <div key={i} className="blog-comment">
                      <span className="blog-comment-avatar">AD</span>
                      <div className="blog-comment-body">
                        <strong>{c.author}</strong>
                        <span>{c.text}</span>
                        <small>{c.date}</small>
                      </div>
                    </div>
                  ))}
                  <div className="blog-comment-input">
                    <span className="blog-comment-avatar">AD</span>
                    <input
                      value={commentTexts[post.id] || ''}
                      onChange={(e) => setCommentTexts((p) => ({ ...p, [post.id]: e.target.value }))}
                      placeholder="Write a comment..."
                      onKeyDown={(e) => e.key === 'Enter' && addComment(post.id)}
                    />
                    <button onClick={() => addComment(post.id)}><Send size={13} /></button>
                  </div>
                </div>
              )}
            </article>
          )
        })}
        {filtered.length === 0 && (
          <div className="blog-empty">
            <Rss size={28} />
            <strong>No posts found</strong>
            <p>Try a different search or be the first to post in this category.</p>
          </div>
        )}
      </div>
    </div>
  )
}
