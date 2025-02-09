import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { FiUsers, FiBookmark, FiCalendar, FiMessageSquare } from 'react-icons/fi';
import { collection, query, where, getDocs, Timestamp } from '@firebase/firestore';
import { db } from '../../services/firebase';
import { DashboardStats } from '../../types';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, trend: { value: 0, isPositive: true } },
    establishments: { total: 0, trend: { value: 0, isPositive: true } },
    activeReplacements: { total: 0, trend: { value: 0, isPositive: true } },
    conversations: { total: 0, trend: { value: 0, isPositive: true } },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const timestamp30DaysAgo = Timestamp.fromDate(thirtyDaysAgo);

        // Utilisateurs - Requête simplifiée
        const usersQuery = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(usersQuery);
        const usersTotal = usersSnapshot.size;

        const newUsersQuery = query(
          collection(db, 'users'),
          where('createdAt', '>=', timestamp30DaysAgo)
        );
        const newUsersSnapshot = await getDocs(newUsersQuery);
        const newUsersTotal = newUsersSnapshot.size;
        const usersTrend = Math.round((newUsersTotal / usersTotal) * 100);

        // Établissements - Requête simplifiée
        const establishmentsQuery = query(collection(db, 'establishments'));
        const establishmentsSnapshot = await getDocs(establishmentsQuery);
        const establishmentsTotal = establishmentsSnapshot.size;

        const newEstablishmentsQuery = query(
          collection(db, 'establishments'),
          where('createdAt', '>=', timestamp30DaysAgo)
        );
        const newEstablishmentsSnapshot = await getDocs(newEstablishmentsQuery);
        const newEstablishmentsTotal = newEstablishmentsSnapshot.size;
        const establishmentsTrend = Math.round((newEstablishmentsTotal / establishmentsTotal) * 100);

        // Remplacements actifs - Requête simplifiée
        const replacementsQuery = query(collection(db, 'replacements'), where('status', '==', 'open'));
        const replacementsSnapshot = await getDocs(replacementsQuery);
        const replacementsTotal = replacementsSnapshot.size;

        // Calculer la tendance des remplacements différemment
        const oldReplacementsTotal = replacementsSnapshot.docs.filter(
          doc => doc.data().createdAt <= timestamp30DaysAgo
        ).length;
        const replacementsTrend = replacementsTotal > 0 
          ? Math.round(((replacementsTotal - oldReplacementsTotal) / replacementsTotal) * 100)
          : 0;

        // Conversations actives - Requête simplifiée
        const conversationsQuery = query(collection(db, 'conversations'), where('status', '==', 'active'));
        const conversationsSnapshot = await getDocs(conversationsQuery);
        const conversationsTotal = conversationsSnapshot.size;

        // Calculer la tendance des conversations différemment
        const oldConversationsTotal = conversationsSnapshot.docs.filter(
          doc => doc.data().createdAt <= timestamp30DaysAgo
        ).length;
        const conversationsTrend = conversationsTotal > 0
          ? Math.round(((conversationsTotal - oldConversationsTotal) / conversationsTotal) * 100)
          : 0;

        setStats({
          users: { 
            total: usersTotal,
            trend: { value: usersTrend, isPositive: usersTrend > 0 }
          },
          establishments: { 
            total: establishmentsTotal,
            trend: { value: establishmentsTrend, isPositive: establishmentsTrend > 0 }
          },
          activeReplacements: { 
            total: replacementsTotal,
            trend: { value: replacementsTrend, isPositive: replacementsTrend > 0 }
          },
          conversations: { 
            total: conversationsTotal,
            trend: { value: conversationsTrend, isPositive: conversationsTrend > 0 }
          },
        });
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-base-content">Tableau de bord</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Utilisateurs"
          value={stats.users.total.toString()}
          icon={<FiUsers />}
          trend={stats.users.trend}
          onClick={() => navigate('/users')}
          color="primary"
        />
        
        <Card
          title="Établissements"
          value={stats.establishments.total.toString()}
          icon={<FiBookmark />}
          trend={stats.establishments.trend}
          onClick={() => navigate('/establishments')}
          color="secondary"
        />
        
        <Card
          title="Remplacements actifs"
          value={stats.activeReplacements.total.toString()}
          icon={<FiCalendar />}
          trend={stats.activeReplacements.trend}
          onClick={() => navigate('/replacements')}
          color="accent"
        />
        
        <Card
          title="Conversations actives"
          value={stats.conversations.total.toString()}
          icon={<FiMessageSquare />}
          trend={stats.conversations.trend}
          color="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-base-content">Nouveaux utilisateurs</h2>
            <div className="h-64 flex items-center justify-center">
              <p className="text-base-content/60">Graphique à venir</p>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-base-content">Remplacements par mois</h2>
            <div className="h-64 flex items-center justify-center">
              <p className="text-base-content/60">Graphique à venir</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 