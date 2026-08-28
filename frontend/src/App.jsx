import React from 'react'
import AnnouncementBar from './Frontdoor/AnnouncementBar'
import Header from './Frontdoor/Header'
import Hero from './Frontdoor/Hero'
import Features from './Frontdoor/Features'
import Coverage from './Frontdoor/Coverage'
import FinalCTA from './Frontdoor/FinalCTA'
import Footer from './Frontdoor/Footer'
import './Frontdoor/frontdoor.css'

export default function App() {
  return (
    <div className="min-h-screen">
      <AnnouncementBar />
      <Header />
      <Hero />
      <Features />
      <Coverage />
      <FinalCTA />
      <Footer />
    </div>
  )
}