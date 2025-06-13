import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import AppRoutes from './routes/AppRoutes'
import ChronoCalendar from './components/Calendar/ChronoCalendar'

const events = [
  {
    id: 1,
    title: 'Réunion projet',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000),
    resource: 'projetA'
  }
  // ...ajoute d'autres événements mock si besoin...
]

function App () {
	return (
		<>
			<Header />
			<AppRoutes />
			<ChronoCalendar
				
			/>
			<Footer />
		</>
	)
}

export default App
