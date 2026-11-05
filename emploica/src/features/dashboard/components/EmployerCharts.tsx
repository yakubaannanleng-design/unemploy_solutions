// Carte des graphiques du tableau de bord employeur (chargée à la demande pour alléger le bundle).
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useLang, t } from "lib/i18n";

interface EmployerChartsProps {
  appsByStatus: { name: string; value: number }[];
  offersByStatus: { name: string; value: number }[];
  viewsData: { name: string; vues: number }[];
}

export default function EmployerCharts({ appsByStatus, offersByStatus, viewsData }: EmployerChartsProps) {
  const { lang } = useLang();
  return (
    <Card>
      <CardHeader><CardTitle>{t("stats", lang) ?? "Statistiques"}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-64">
            <p className="text-sm font-medium mb-2">{t("applications", lang)}</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appsByStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(20 80% 48%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-64">
            <p className="text-sm font-medium mb-2">{t("offers", lang)}</p>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={offersByStatus} dataKey="value" nameKey="name" outerRadius={80} label>
                  {offersByStatus.map((_, i) => (
                    <Cell key={i} fill={["#e8793a", "#f2a672", "#b8531f"][i % 3]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        {viewsData.length > 0 && (
          <div className="h-64 mt-4">
            <p className="text-sm font-medium mb-2">{t("views", lang) ?? "Vues par offre"}</p>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="vues" fill="hsl(20 60% 25%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}