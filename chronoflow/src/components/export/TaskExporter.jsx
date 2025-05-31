import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import chronoflowLogo from '../../../src/assets/logo.png' 
import { Chart } from 'chart.js/auto'

// Logo en base64 si pas de fichier d'image
const LOGO_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAoCAYAAAAIeF9DAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFvUlEQVR4nO1aTW/bRhDd/UWBe+uhQA5pAOezkppUDeIkpyq3fjS5BTnHaZFDD24Q59jklOTU/IMe2oOzS7mSLFEU90NBKdAStrCzb1YfyyVFUZRkOw8QKFKc2eXbNzNvlpTSQAMNNNBAA3cRRFRebKyvAVTiZG6ODnEyN8Pb52dnZ+XFxvo3utZxbxaXsCH8rjvWHVIH9ncB7xPRIhE9JKI5p7vbHQ6Hw+FwOBwOh8PhcDgcDofD4XA4HA5Hm1SvbSKoeAjKnVZQDHB+K7ymD6kfX1NL21tbRETJQcaEgH0i+oqIPnvOwzXXSB1MdBkxVvawEhRDnCGEGhQj2k5SUaDl5FgwEEN8Ct6SEsN7VKHE+pUxZT59MTFpTH1JRD9OT0+fKXWKuquLQqHgsV4fwzBWlFKT15EdlFLLWusUpXQlPqdpumOMUYyx9UajMRFFUUdROZube7D/ZH+fiB4T0SQR/aJAP4NE9E3UclawohkK3rJliGCIwFC8tIh86bYoMUQAZZAcE6MYZqwQBexDfL5IGWS2iRJDEBXDpJm5E2Pmst5GkhYAsF8qleYAICMiE7IsO5qcnPwqDEOPiB4BwHoQBC3p2tramhBCTkxM7APAvggNCwsLpwDwIk3TXeUIfVQ8Kj7Uf8MU6LnY6vv35e6rXbp9p1arhWEY9gHgJAiCCAC8TkDcXLeu6z7W2UYO7OmxDZjmrEjuXACIAKAPAOP4OoqiXrPZXO92uxlKaUkp1ZHaLkNrPQEAWZqmHQDwlVIFrXVEKT2XWqeMsVUAUGEYZsPh8FdCSFkI0VaOCGxFoIvXkwdy90fzcri1uXn/nQH79OlTCgBPDw4OWktLSzcA4JnRZlQEZU+OhcCKus0MsGElLXBwPAu+NcWU4rFVhVaQ7D7yJgU7jtzHn7vSAAvBKnvEH0GQZVma0vSbkoImwnIYYxMry2NjY5sA0HjLKbRMQsy2JUriAGBQqYx2f+SY/cWQFKKZYSVNcp28V9TKCuW5Fgy5CNLk9pXeGhvd2zkIlSgFy4I0NgpI33OvharV6n2t9TO1hm2CF+2k81RJYc8KyWSHdvZiIcZiuJY8N6IICxKiQIEVQiJsdnZxKvSaVmJopQcmm6TmkPq1bIhQDvS6iBPTO0IQhFSEO0puPSptQgjZarVGRu9VIBL6jghfxni2ySFlMbY3N3c7B2Y3XtW4Va1Wf0zT9E1cC4PczVcWMIs4MTElYdhEn1lJDFvLKVqRZcJ9x4oeJeWYLBPrgc0stmyQuI9EH6dIJUeyrOVDpZQfx3G51WpFpVIpJaIiEf30jntKiOhJ3IMuMsYKWusyANRarVZGKS3HcVxGSbppueC3GFRxta/T3RrJH+fQvIGBxvrqQ15QJDGtG68QJBzLpsyR1QNcR3aQI8M2WMB+poRdxi7LSD40sXx5hShp62FmbOXTvlRbWRUZJVarXF5eroZh+DwMQwkAB0R0893Dveuh1+uNE9E/RHQGAAt3NjOI94/4PtePC3kyizAMv4/jeMwYM4YZ8OE9OnA/SZJJIvpMa31QKBQWer1enYgeatH5q3OaXGqZRrJ/4P6B+wcejc1dKfvyd5rQ0TAKVGAEQ0Rle8DDnZ2d+5QkScEY0yOiIhH9QkQPbtuc3tGFEQ8fiiC4F8dxNYqiw7GxsRUi+k1rPfehXpbr/FEJIfYA4KTVap1VKpXvtNYnlUp/70ys08dreXl5JIqi55VKZXdlZeU4TdMFIvp2FPqEEJ7neZNSypkwDB8opeqj0HuVnbm5ud/K5fJuoVB4AgAvRqVXCOFprRuHh4dP6vX6L0T0iIj+HZVu3O4RUaFWq/2ulPKklKfVavXhqHQ7OBwOh+MO4z8KMdlZjc58fgAAAABJRU5ErkJggg==';

/**
 * Formate une durée en secondes au format hh:mm:ss
 * @param {number} seconds - Durée en secondes
 * @returns {string} Durée formatée
 */
function formatDuration(seconds) {
	if (!seconds || isNaN(seconds)) return '00:00:00'
	const h = Math.floor(seconds / 3600)
	const m = Math.floor((seconds % 3600) / 60)
	const s = seconds % 60
	return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

/**
 * Exporte une tâche ou un ensemble de tâches dans différents formats
 * @param {Object} options - Options d'exportation
 * @param {Object|Object[]} options.tasks - La tâche ou les tâches à exporter
 * @param {string} options.format - Format d'exportation ('csv', 'pdf', 'productivity-report')
 * @param {string} options.lang - Langue ('fr' ou 'en')
 * @param {Object} options.user - Informations sur l'utilisateur
 * @returns {Promise<string|Blob>} URL de téléchargement ou blob
 */
export async function exportTask({ tasks, format = 'csv', lang = 'fr', user }) {
	// Si on a une seule tâche, la convertir en tableau
	const tasksArray = Array.isArray(tasks) ? tasks : [tasks]
	
	switch (format) {
		case 'csv':
			return exportToCsv(tasksArray, lang)
			
		case 'pdf':
			return exportToPdf(tasksArray, lang)
			
		case 'productivity-report':
			return exportProductivityReport(tasksArray, lang, user)
			
		default:
			throw new Error(`Format d'exportation non supporté: ${format}`)
	}
}

/**
 * Exporte des tâches au format CSV
 * @param {Object[]} tasks - Les tâches à exporter
 * @param {string} lang - Langue ('fr' ou 'en')
 * @returns {string} URL de téléchargement
 */
function exportToCsv(tasks, lang) {
	const headers = lang === 'fr' 
		? 'Titre,Description,Durée (s),Durée (hh:mm:ss),Terminé,Date de début,Date de fin\n'
		: 'Title,Description,Duration (s),Duration (hh:mm:ss),Finished,Start Date,End Date\n'
	const csvContent = tasks.map(task => {
		const duration = typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0)
		return [
			`"${task.title || ''}"`,
			`"${task.description || ''}"`,
			duration,
			formatDuration(duration),
			task.is_finished ? (lang === 'fr' ? 'Oui' : 'Yes') : (lang === 'fr' ? 'Non' : 'No'),
			task.start ? new Date(task.start).toLocaleString() : '',
			task.end ? new Date(task.end).toLocaleString() : '',
		].join(',')
	}).join('\n')
	const fullCsv = headers + csvContent
	const blob = new Blob([fullCsv], { type: 'text/csv' })
	const url = URL.createObjectURL(blob)
	const filename = tasks.length === 1 
		? `${tasks[0].title || 'task'}.csv` 
		: 'tasks-export.csv'
	triggerDownload(url, filename)
	return url
}

/**
 * Ajoute le logo Chronoflow au document PDF
 * @param {jsPDF} doc - Document PDF
 */
function addLogo(doc) {
	try {
		// Décaler le logo plus à gauche (x = 4)
		const logoWidth = 55 // Largeur du logo
		const logoHeight = 15 // Hauteur du logo
		doc.addImage(chronoflowLogo, 'PNG', 4, 10, logoWidth, logoHeight)
	} catch (error) {
		// Fallback au logo en base64 si l'import échoue
		const fallbackWidth = 40
		const fallbackHeight = 15
		doc.addImage(LOGO_BASE64, 'PNG', 4, 10, fallbackWidth, fallbackHeight)
	}
}

/**
 * Exporte des tâches au format PDF
 * @param {Object[]} tasks - Les tâches à exporter
 * @param {string} lang - Langue ('fr' ou 'en')
 * @returns {string} URL de téléchargement
 */
function exportToPdf(tasks, lang) {
	const doc = new jsPDF()
	
	// Ajouter le logo avec les dimensions ajustées
	addLogo(doc)
	
	// Titre du document - déplacé vers la droite pour laisser place au logo
	doc.setFontSize(18)
	doc.setTextColor(40, 99, 175) // bleu
	doc.text(lang === 'fr' ? 'Rapport de tâches' : 'Task Report', 80, 22)
	
	// Information de date
	doc.setFontSize(10)
	doc.setTextColor(100, 100, 100)
	doc.text(new Date().toLocaleString(), 80, 30)
	
	// Tableau des tâches
	const headers = [
		lang === 'fr' ? 'Titre' : 'Title',
		lang === 'fr' ? 'Durée' : 'Duration',
		lang === 'fr' ? 'Terminé' : 'Finished',
		lang === 'fr' ? 'Date de début' : 'Start Date',
	]
	
	const data = tasks.map(task => {
		const duration = typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0)
		return [
			task.title || '',
			formatDuration(duration),
			task.is_finished ? 'YES' : 'NO',
			task.start ? new Date(task.start).toLocaleDateString() : '-',
		]
	})
	
	autoTable(doc, {
		head: [headers],
		body: data,
		startY: 35,
		styles: { fontSize: 10 },
		headStyles: { fillColor: [66, 133, 244], textColor: 255 },
		alternateRowStyles: { fillColor: [240, 240, 240] },
	})
	
	// Résumé
	const totalDuration = tasks.reduce((sum, task) => sum + (typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0)), 0)
	const completedTasks = tasks.filter(task => task.is_finished).length
	
	doc.setFontSize(12)
	doc.setTextColor(60, 60, 60)
	// Utilisez la dernière position de tableau depuis l'objet retourné
	const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 50
	doc.text(lang === 'fr' ? 'Résumé' : 'Summary', 14, finalY + 15)
	
	doc.setFontSize(10)
	doc.text(lang === 'fr' ? `Nombre total de tâches: ${tasks.length}` : `Total tasks: ${tasks.length}`, 14, finalY + 25)
	doc.text(lang === 'fr' ? `Tâches terminées: ${completedTasks}` : `Completed tasks: ${completedTasks}`, 14, finalY + 32)
	doc.text(lang === 'fr' ? `Temps total passé: ${formatDuration(totalDuration)}` : `Total time spent: ${formatDuration(totalDuration)}`, 14, finalY + 39)
	
	// Générer et télécharger le PDF
	const blob = doc.output('blob')
	const url = URL.createObjectURL(blob)
	
	const filename = tasks.length === 1 
		? `${tasks[0].title || 'task'}.pdf` 
		: 'tasks-report.pdf'
	
	triggerDownload(url, filename)
	
	return url
}

/**
 * Exporte un rapport de productivité complet
 * @param {Object[]} tasks - Les tâches à exporter
 * @param {string} lang - Langue ('fr' ou 'en')
 * @param {Object} user - Informations sur l'utilisateur
 * @returns {string} URL de téléchargement
 */
async function exportProductivityReport(tasks, lang, user) {
	const doc = new jsPDF()
	addLogo(doc)

	// Placement du titre et des sous-titres sans chevauchement
	doc.setFontSize(24)
	doc.setTextColor(40, 99, 175)
	doc.text(
		lang === 'fr' ? 'Rapport de productivité' : 'Productivity Report',
		doc.internal.pageSize.getWidth() / 2,
		22,
		{ align: 'center' }
	)
	doc.setFontSize(12)
	doc.setTextColor(80, 80, 80)
	doc.text(
		lang === 'fr' ? `Généré pour: ${user.email || user.name}` : `Generated for: ${user.email || user.name}`,
		doc.internal.pageSize.getWidth() / 2,
		32,
		{ align: 'center' }
	)
	doc.text(new Date().toLocaleDateString(), doc.internal.pageSize.getWidth() / 5, 39, { align: 'center' })

	// Extraction des durées et dates
	const durations = tasks.map(task => (typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0)))
	const totalDuration = durations.reduce((sum, d) => sum + d, 0)
	const avgDuration = durations.length ? Math.round(totalDuration / durations.length) : 0
	const maxDuration = durations.length ? Math.max(...durations) : 0
	const minDuration = durations.length ? Math.min(...durations) : 0
	const completedTasks = tasks.filter(task => task.is_finished).length
	const pendingTasks = tasks.length - completedTasks
	const completionRate = tasks.length > 0 ? (completedTasks / tasks.length * 100).toFixed(1) : 0

	// Regroupement par période (auto : jour, semaine, ou mois selon l’étendue et le nombre de barres)
	const parseDate = d => d ? new Date(d) : null
	const allDates = tasks.map(t => parseDate(t.start)).filter(Boolean).sort((a, b) => a - b)
	let periodType = 'day'
	if (allDates.length > 1) {
		const first = allDates[0], last = allDates[allDates.length - 1]
		const diffDays = (last - first) / (1000 * 60 * 60 * 24)
		// Générer les périodes par jour pour compter le nombre de barres
		const dayLabels = []
		for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
			dayLabels.push(d.toISOString().slice(0, 10))
		}
		if (dayLabels.length > 30) {
			// Trop de jours, on passe à la semaine
			periodType = 'week'
			// Compter le nombre de semaines
			const weekLabels = []
			let d = new Date(first)
			d.setDate(d.getDate() - d.getDay())
			while (d <= last) {
				weekLabels.push(`${d.getFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`)
				d.setDate(d.getDate() + 7)
			}
			if (weekLabels.length > 18) {
				// Encore trop, on passe au mois
				periodType = 'month'
			}
		}
	}
	function getWeekNumber(date) {
		const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
		const dayNum = d.getUTCDay() || 7
		d.setUTCDate(d.getUTCDate() + 4 - dayNum)
		const yearStart = new Date(Date.UTC(d.getFullYear(),0,1))
		return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
	}
	// Correction de la clé de regroupement pour garantir une addition correcte par période
	// Correction : regrouper par date locale (getFullYear, getMonth, getDate)
	const formatPeriod = date => {
		if (!date) return '-'
		const d = new Date(date)
		if (periodType === 'month') {
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
		}
		if (periodType === 'week') {
			return `${d.getFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`
		}
		// Par défaut, jour au format YYYY-MM-DD (locale)
		return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
	}
	const periodMap = {}
	tasks.forEach(task => {
		const period = formatPeriod(task.start)
		const duration = typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0)
		if (!periodMap[period]) periodMap[period] = 0
		periodMap[period] += duration
	})
	// Générer toutes les périodes entre la première et la dernière date, même vides
	let fullPeriodLabels = []
	if (allDates.length > 0) {
		const first = allDates[0]
		const last = allDates[allDates.length - 1]
		if (periodType === 'day') {
			let d = new Date(first)
			while (d <= last) {
				fullPeriodLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)
				d.setDate(d.getDate() + 1)
			}
		} else if (periodType === 'week') {
			let d = new Date(first)
			d.setDate(d.getDate() - d.getDay())
			while (d <= last) {
				fullPeriodLabels.push(`${d.getFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`)
				d.setDate(d.getDate() + 7)
			}
		} else if (periodType === 'month') {
			let d = new Date(first.getFullYear(), first.getMonth(), 1)
			while (d <= last) {
				fullPeriodLabels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
				d.setMonth(d.getMonth() + 1)
			}
		}
	}
	// Remplir les périodes vides à zéro
	const periodLabels = fullPeriodLabels.length ? fullPeriodLabels : Object.keys(periodMap)
	const periodDurations = periodLabels.map(label => periodMap[label] || 0)

	// Statistiques générales avancées
	doc.setFontSize(18)
	doc.setTextColor(40, 99, 175)
	doc.text(lang === 'fr' ? 'Statistiques générales' : 'General Statistics', 14, 49)
	const statsHeaders = [[
		lang === 'fr' ? 'Métrique' : 'Metric',
		lang === 'fr' ? 'Valeur' : 'Value',
	]]
	const statsData = [
		[lang === 'fr' ? 'Nombre total de tâches' : 'Total tasks', tasks.length.toString()],
		[lang === 'fr' ? 'Tâches terminées' : 'Completed tasks', completedTasks.toString()],
		[lang === 'fr' ? 'Tâches en cours' : 'Pending tasks', pendingTasks.toString()],
		[lang === 'fr' ? 'Taux de complétion' : 'Completion rate', `${completionRate}%`],
		[lang === 'fr' ? 'Temps total travaillé' : 'Total time worked', formatDuration(totalDuration)],
		[lang === 'fr' ? 'Durée moyenne' : 'Average duration', formatDuration(avgDuration)],
		[lang === 'fr' ? 'Durée max' : 'Max duration', formatDuration(maxDuration)],
		[lang === 'fr' ? 'Durée min' : 'Min duration', formatDuration(minDuration)],
	]

	autoTable(doc, {
		head: statsHeaders,
		body: statsData,
		startY: 55,
		styles: { fontSize: 11 },
		headStyles: { fillColor: [66, 133, 244], textColor: 255 },
		alternateRowStyles: { fillColor: [240, 240, 240] },
	})

	// Positionner le graphique juste après le tableau de stats
	const afterStatsY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 100
	// Calcul dynamique de l'axe Y du graphique (max = total max par période, sans arrondi)
	const maxPeriodTotal = Math.max(...periodDurations, 1)
	let chartImage = null
	try {
		const chartCanvas = document.createElement('canvas')
		chartCanvas.width = 400
		chartCanvas.height = 250
		chartCanvas.style.padding = '0'
		const chartContext = chartCanvas.getContext('2d')
		// Nouvelle logique : axe Y strictement de 0 à max, ticks uniquement 0 et max, aucune division
		new Chart(chartContext, {
			type: 'bar',
			data: {
				labels: periodLabels,
				datasets: [{
					label: lang === 'fr' ? 'Temps passé (s)' : 'Time spent (s)',
					data: periodDurations,
					backgroundColor: '#4285F4',
					barPercentage: 1,
					categoryPercentage: 1,
					borderRadius: 0,
					borderSkipped: false,
					borderWidth: 0,
					clip: false,
				}],
			},
			options: {
				responsive: false,
				maintainAspectRatio: false,
				layout: { padding: 0 },
				scales: {
					y: {
						type: 'linear',
						beginAtZero: true,
						min: 0,
						max: maxPeriodTotal,
						grace: 0,
						offset: false,
						ticks: {
							stepSize: undefined,
							callback: v => formatDuration(v),
							count: 2,
							padding: 0,
						},
						grid: { drawBorder: true, drawTicks: true, drawOnChartArea: true },
					},
					x: {
						grid: { drawBorder: true, drawTicks: true, drawOnChartArea: false },
					},
				},
				plugins: {
					legend: { display: false },
					chartArea: { backgroundColor: null, padding: { top: 0, bottom: 0 } },
				},
			},
		})
		await new Promise(r => setTimeout(r, 150))
		chartImage = chartCanvas.toDataURL('image/png')
	} catch (err) {
		console.error('Graphique non généré (canvas non dispo)', err)
	}
	// Titre du graphique
	const chartTitle = lang === 'fr' ? 'Évolution du temps total par période' : 'Total Time Spent per Period'
	if (chartImage) {
		doc.setFontSize(15)
		doc.setTextColor(40, 99, 175)
		doc.text(chartTitle, 14, afterStatsY + 8)
		doc.addImage(chartImage, 'PNG', 14, afterStatsY + 14, 180, 72) // Ratio fidèle à la hauteur du canvas
	}

	// Décaler la section Détails des tâches plus bas (décalage +30px)
	const afterChartY = afterStatsY + 104
	doc.setFontSize(18)
	doc.setTextColor(40, 99, 175)
	doc.text(lang === 'fr' ? 'Détails des tâches' : 'Task Details', 14, afterChartY)
	const taskHeaders = [
		lang === 'fr' ? 'Titre' : 'Title',
		lang === 'fr' ? 'Durée' : 'Duration',
		lang === 'fr' ? 'Statut' : 'Status',
		lang === 'fr' ? 'Créé le' : 'Created',
	]
	const taskData = tasks.map(task => {
		const duration = typeof task.durationSeconds === 'number' ? task.durationSeconds : (task.duration_seconds ?? 0)
		return [
			task.title || '',
			formatDuration(duration),
			task.is_finished
				? (lang === 'fr' ? 'Terminé' : 'Completed')
				: (lang === 'fr' ? 'En cours' : 'In progress'),
			task.start ? new Date(task.start).toLocaleDateString() : '-',
		]
	})

	autoTable(doc, {
		head: [taskHeaders],
		body: taskData,
		startY: afterChartY + 5,
		styles: { fontSize: 10 },
		headStyles: { fillColor: [66, 133, 244], textColor: 255 },
		alternateRowStyles: { fillColor: [240, 240, 240] },
		margin: { left: 14, right: 14 },
	})

	const blob = doc.output('blob')
	const url = URL.createObjectURL(blob)
	const filename = 'productivity-report.pdf'
	triggerDownload(url, filename)
	return url
}

/**
 * Déclenche le téléchargement d'un fichier
 * @param {string} url - URL du blob à télécharger
 * @param {string} filename - Nom du fichier
 */
function triggerDownload(url, filename) {
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Composant modal d'exportation avancée
 */
function TaskExporterModal({ isOpen, onClose, tasks = [], user, lang = 'fr' }) {
	const [format, setFormat] = useState('pdf')
	const [isExporting, setIsExporting] = useState(false)
	
	// Nombre de tâches à exporter
	const tasksCount = tasks?.length || 0
	
	const handleExport = async () => {
		setIsExporting(true)
		try {
			await exportTask({
				tasks,
				format,
				lang,
				user // L'utilisateur est forcément connecté donc on passe directement user
			})
			setTimeout(() => {
				setIsExporting(false)
				onClose()
			}, 500)
		} catch (error) {
			console.error('Erreur lors de l\'exportation', error)
			setIsExporting(false)
			alert(lang === 'fr' 
				? `Erreur lors de l'exportation: ${error.message}` 
				: `Export error: ${error.message}`)
		}
	}
	
	if (!isOpen) return null
	
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
				<h2 className="text-xl font-semibold text-blue-700 mb-2">
					{lang === 'fr' ? 'Exporter les données' : 'Export Data'}
				</h2>
				
				{/* Afficher le nombre de tâches qui seront exportées */}
				<p className="text-sm text-gray-600 mb-4">
					{lang === 'fr'
						? `${tasksCount} tâche${tasksCount > 1 ? 's' : ''} à exporter`
						: `${tasksCount} task${tasksCount > 1 ? 's' : ''} to export`}
				</p>
				
				<div className="mb-6">
					<label className="block text-gray-700 mb-2">
						{lang === 'fr' ? 'Format d\'exportation' : 'Export Format'}
					</label>
					<div className="grid grid-cols-1 gap-2">
						<label className="flex items-center p-3 border rounded hover:bg-blue-50 cursor-pointer">
							<input
								type="radio"
								name="format"
								value="csv"
								checked={format === 'csv'}
								onChange={() => setFormat('csv')}
								className="mr-2"
							/>
							<div>
								<div className="font-medium">CSV</div>
								<div className="text-sm text-gray-500">
									{lang === 'fr' 
										? 'Format simple pour l\'analyse dans Excel/Google Sheets' 
										: 'Simple format for Excel/Google Sheets analysis'}
								</div>
							</div>
						</label>
						
						<label className="flex items-center p-3 border rounded hover:bg-blue-50 cursor-pointer">
							<input
								type="radio"
								name="format"
								value="pdf"
								checked={format === 'pdf'}
								onChange={() => setFormat('pdf')}
								className="mr-2"
							/>
							<div>
								<div className="font-medium">PDF</div>
								<div className="text-sm text-gray-500">
									{lang === 'fr' 
										? 'Document formaté, idéal pour l\'archivage' 
										: 'Formatted document, ideal for archiving'}
								</div>
							</div>
						</label>
						
						<label className="flex items-center p-3 border rounded hover:bg-blue-50 cursor-pointer">
							<input
								type="radio"
								name="format"
								value="productivity-report"
								checked={format === 'productivity-report'}
								onChange={() => setFormat('productivity-report')}
								className="mr-2"
							/>
							<div>
								<div className="font-medium">
									{lang === 'fr' ? 'Rapport de productivité' : 'Productivity Report'}
								</div>
								<div className="text-sm text-gray-500">
									{lang === 'fr' 
										? 'Rapport détaillé avec analyses et statistiques' 
										: 'Detailed report with analytics and statistics'}
								</div>
							</div>
						</label>
					</div>
				</div>
				
				<div className="flex justify-end gap-2 mt-6">
					<button
						onClick={onClose}
						className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
					>
						{lang === 'fr' ? 'Annuler' : 'Cancel'}
					</button>
					<button
						onClick={handleExport}
						disabled={isExporting}
						className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
					>
						{isExporting ? (
							<>
								<span className="animate-spin">⏳</span>
								{lang === 'fr' ? 'Exportation...' : 'Exporting...'}
							</>
						) : (
							<>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8 12V4M8 12L5 9M8 12L11 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
									<path d="M3 15H13C14.1046 15 15 14.1046 15 13V3C15 1.89543 14.1046 1 13 1H3C1.89543 1 1 1.89543 1 3V13C1 14.1046 1.89543 15 3 15Z" stroke="currentColor" strokeWidth="2"/>
								</svg>
								{lang === 'fr' ? 'Exporter' : 'Export'}
							</>
						)}
					</button>
				</div>
			</div>
		</div>
	)
}

export default TaskExporterModal
