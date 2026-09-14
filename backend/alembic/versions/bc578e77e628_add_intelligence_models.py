"""Add intelligence models

Revision ID: bc578e77e628
Revises: 001
Create Date: 2026-09-10 05:18:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bc578e77e628'
down_revision: Union[str, None] = '001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # market_prices
    op.create_table('market_prices',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('commodity', sa.String(length=100), nullable=False),
    sa.Column('district', sa.String(length=100), nullable=False),
    sa.Column('wholesale_price', sa.Float(), nullable=False),
    sa.Column('retail_price', sa.Float(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('trend', sa.String(length=20), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_market_prices_commodity'), 'market_prices', ['commodity'], unique=False)
    op.create_index(op.f('ix_market_prices_district'), 'market_prices', ['district'], unique=False)

    # notifications
    op.create_table('notifications',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('farmer_id', sa.UUID(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('message', sa.Text(), nullable=False),
    sa.Column('type', sa.Enum('alert', 'weather', 'market', 'general', name='notificationtype'), nullable=False),
    sa.Column('is_read', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['farmer_id'], ['farmers.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_notifications_farmer_id'), 'notifications', ['farmer_id'], unique=False)

    # risk_alerts
    op.create_table('risk_alerts',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('district', sa.String(length=100), nullable=False),
    sa.Column('upazila', sa.String(length=100), nullable=True),
    sa.Column('risk_type', sa.String(length=50), nullable=False),
    sa.Column('severity', sa.String(length=20), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('active_until', sa.DateTime(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_risk_alerts_district'), 'risk_alerts', ['district'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_risk_alerts_district'), table_name='risk_alerts')
    op.drop_table('risk_alerts')
    op.drop_index(op.f('ix_notifications_farmer_id'), table_name='notifications')
    op.drop_table('notifications')
    op.drop_index(op.f('ix_market_prices_district'), table_name='market_prices')
    op.drop_index(op.f('ix_market_prices_commodity'), table_name='market_prices')
    op.drop_table('market_prices')
    op.execute('DROP TYPE notificationtype')
